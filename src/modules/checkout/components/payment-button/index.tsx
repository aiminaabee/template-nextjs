"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { HttpTypes } from "@aiminaabeejs/types";
import { isManual, isStripe } from "@lib/constants";
import { placeOrder } from "@lib/data/cart";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import React, { useState } from "react";
import ErrorMessage from "../error-message";

type PaymentButtonProps = {
  storeCode: string;
  cart: HttpTypes.StoreCart;
  "data-testid": string;
};

const PaymentButton: React.FC<PaymentButtonProps> = ({
  storeCode,
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1;

  const paymentSession = cart.payment_collection?.payment_sessions?.[0];

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          storeCode={storeCode}
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      );
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton
          storeCode={storeCode}
          notReady={notReady}
          data-testid={dataTestId}
        />
      );
    default:
      return <Button disabled>Select a payment method</Button>;
  }
};

const StripePaymentButton = ({
  storeCode,
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  storeCode: string;
  cart: HttpTypes.StoreCart;
  notReady: boolean;
  "data-testid"?: string;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onPaymentCompleted = async () => {
    await placeOrder(storeCode)
      .catch((err) => {
        setErrorMessage(err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const stripe = useStripe();
  const elements = useElements();
  const card = elements?.getElement("card");

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  );

  const disabled = !stripe || !elements ? true : false;

  const handlePayment = async () => {
    setSubmitting(true);

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false);
      return;
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }) => {
        if (error) {
          const pi = error.payment_intent;

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted();
          }

          setErrorMessage(error.message || null);
          return;
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted();
        }

        return;
      });
  };

  return (
    <>
      <Button
        disabled={disabled || notReady || submitting}
        onClick={handlePayment}
        size="lg"
        data-testid={dataTestId}
      >
        {submitting ? <Spinner data-icon="inline-start" /> : null}
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  );
};

const ManualTestPaymentButton = ({
  storeCode,
  notReady,
}: {
  storeCode: string;
  notReady: boolean;
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onPaymentCompleted = async () => {
    await placeOrder(storeCode)
      .catch((err) => {
        setErrorMessage(err.message);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handlePayment = () => {
    setSubmitting(true);

    onPaymentCompleted();
  };

  return (
    <>
      <Button
        disabled={notReady || submitting}
        onClick={handlePayment}
        size="lg"
        data-testid="submit-order-button"
      >
        {submitting ? <Spinner data-icon="inline-start" /> : null}
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  );
};

export default PaymentButton;
