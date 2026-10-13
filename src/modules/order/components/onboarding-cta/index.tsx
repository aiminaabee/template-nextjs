"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@modules/common/components/ui";
import { resetOnboardingState } from "@lib/data/onboarding";

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <Card className="max-w-4xl h-full bg-ui-bg-subtle w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <Text className="text-ui-fg-base text-xl">
          Your test order was successfully created! 🎉
        </Text>
        <Text className="text-ui-fg-subtle text-small-regular">
          You can now complete setting up your store in the admin.
        </Text>
        <Button
          className="w-fit"
          size="lg"
          onClick={() => resetOnboardingState(orderId)}
        >
          Complete setup in admin
        </Button>
      </div>
    </Card>
  );
};

export default OnboardingCta;
