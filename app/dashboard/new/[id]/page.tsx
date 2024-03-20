import SubmitButton from "@/components/submit-buttons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

const getData = async (userID: string, noteID: string) => {
  noStore();
  const data = await prisma.note.findUnique({
    where: {
      ID: noteID,
      userID: userID,
    },
    select: {
      ID: true,
      title: true,
      description: true,
    },
  });

  return data;
};

const EditNotePage = async ({ params }: { params: { id: string } }) => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const data = await getData(user?.id as string, params.id);

  const postData = async(formData: FormData) => {
    "use server";

    if (!user) throw new Error("User not found");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    await prisma.note.update({
      where: {
        ID: params.id,
      },
      data: {
        title: title,
        description: description,
      },
    });

    revalidatePath("/dashboard");

    return redirect("/dashboard");
  }

  return (
    <Card>
      <form action={postData}>
        <CardHeader>
          <CardTitle>Edit note</CardTitle>
          <CardDescription>You can edit your note</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-5">
          <div className="gap-y-2 flex flex-col">
            <Label>Title</Label>
            <Input
              required
              type={"text"}
              name="title"
              placeholder="A nice title for your note"
              defaultValue={data?.title}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>Description</Label>
            <Textarea
              required
              name="description"
              placeholder="Tell me more about your thoughts here"
              defaultValue={data?.description}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant={"destructive"} asChild>
            <Link href={"/dashboard"}>Cancel</Link>
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
};

export default EditNotePage;
