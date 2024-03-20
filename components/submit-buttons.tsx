"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Loader2, Save, ShoppingCart, Trash } from "lucide-react";

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button className="w-fit rounded-full" disabled>
          <Loader2 className="animate-spin" />
        </Button>
      ) : (
        <Button type="submit" className=" w-fit rounded-full">
          <Save className="w-6 h-6 rounded-full" />
        </Button>
      )}
    </>
  );
};

export default SubmitButton;

export const StripeSubscriptionButton = () => {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button className="w-full" disabled>
          <Loader2 className="animate-spin" />
        </Button>
      ) : (
        <Button type="submit" className="w-full">
          <ShoppingCart className=" mr-2 w-4 h-4" /> Buy
        </Button>
      )}
    </>
  );
};

export const StripePortalButton = () => {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button className="w-fit" disabled>
          <Loader2 className="animate-spin" />
        </Button>
      ) : (
        <Button type="submit" className="w-fit">
          View billing details
        </Button>
      )}
    </>
  );
};

export const NoteDelete = () => {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button className="w-fit" disabled variant={'destructive'}>
          <Loader2 className="animate-spin" />
        </Button>
      ) : (
        <Button size={'icon'} variant={'destructive'} type="submit">
          <Trash className="w-4 h-4" />
        </Button>
      )}
    </>
  );
};
