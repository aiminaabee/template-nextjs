"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@modules/common/components/ui";
import {
  acceptTransferRequest,
  declineTransferRequest,
} from "@lib/data/orders";
import { useState } from "react";

type TransferStatus = "pending" | "success" | "error";

const TransferActions = ({ id, token }: { id: string; token: string }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    accept: TransferStatus | null;
    decline: TransferStatus | null;
  } | null>({
    accept: null,
    decline: null,
  });

  const acceptTransfer = async () => {
    setStatus({ accept: "pending", decline: null });
    setErrorMessage(null);

    const { success, error } = await acceptTransferRequest(id, token);

    if (error) setErrorMessage(error);
    setStatus({ accept: success ? "success" : "error", decline: null });
  };

  const declineTransfer = async () => {
    setStatus({ accept: null, decline: "pending" });
    setErrorMessage(null);

    const { success, error } = await declineTransferRequest(id, token);

    if (error) setErrorMessage(error);
    setStatus({ accept: null, decline: success ? "success" : "error" });
  };

  return (
    <div className="flex flex-col gap-y-4">
      {status?.accept === "success" && (
        <Text className="text-emerald-500">
          Order transferred successfully!
        </Text>
      )}
      {status?.decline === "success" && (
        <Text className="text-emerald-500">
          Order transfer declined successfully!
        </Text>
      )}
      {status?.accept !== "success" && status?.decline !== "success" && (
        <div className="flex gap-x-4">
          <Button
            size="lg"
            onClick={acceptTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.accept === "pending" ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Accept transfer
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={declineTransfer}
            disabled={
              status?.accept === "pending" || status?.decline === "pending"
            }
          >
            {status?.decline === "pending" ? (
              <Spinner data-icon="inline-start" />
            ) : null}
            Decline transfer
          </Button>
        </div>
      )}
      {errorMessage && <Text className="text-red-500">{errorMessage}</Text>}
    </div>
  );
};

export default TransferActions;
