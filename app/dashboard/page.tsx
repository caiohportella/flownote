import { NoteDelete } from "@/components/submit-buttons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Edit, File } from "lucide-react";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

const getData = async (userID: string) => {
  noStore();
  const data = await prisma.user.findUnique({
    where: {
      ID: userID,
    },
    select: {
      Notes: true,
      Subscription: {
        select: {
          status: true,
        },
      },
    },
  });

  return data;
};

const DashboardPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const data = await getData(user?.id as string);

  const deleteNote = async (formData: FormData) => {
    "use server";

    const noteID = formData.get("noteID") as string;

    await prisma.note.delete({
      where: {
        ID: noteID,
      },
    });

    revalidatePath("/dashboard");
  };

  return (
    <div className="grid items-start gap-y-8">
      <div className="flex flex-col lg:flex-row gap-y-8 items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-3xl md:text-4xl">Your Notes</h1>
          <p className="text-lg text-muted-foreground">
            Here you can see and create new notes
          </p>
        </div>

        {data?.Subscription?.status === "active" ? (
          <Button asChild>
            <Link href={"/dashboard/new"}>Create a new note</Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href={"/dashboard/billing"}>Create a new note</Link>
          </Button>
        )}
      </div>

      {data?.Notes.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed tet-center p-8 animte-in fade-in-50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <File className="w-10 h-10 text-primary" />
          </div>

          <h1 className="mt-6 text-xl font-semibold">
            You don&apos;t have any notes
          </h1>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            Notes you create will be displayed right here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-y-4">
          {data?.Notes.map((item) => {
            return (
              <Card
                key={item.ID}
                className="flex items-center justify-between p-4"
              >
                <div className="">
                  <h2 className="font-semibold text-xl text-primary">
                    {item.title}
                  </h2>
                  <p>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(new Date(item.createdAt))}
                  </p>
                </div>

                <div className="flex gap-x-4">
                  <Link href={`/dashboard/new/${item.ID}`}>
                    <Button variant={"outline"} size={"icon"}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <form action={deleteNote}>
                    <input type="hidden" name="noteID" value={item.ID} />
                    <NoteDelete />
                  </form>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
