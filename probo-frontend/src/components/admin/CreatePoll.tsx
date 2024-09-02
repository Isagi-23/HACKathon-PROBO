import React, { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { CalendarIcon, Loader2, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Label } from "../ui/label";
import { Cloudinary } from "@cloudinary/url-gen";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { z } from "zod";
import useMutate from "@/lib/helperHooks.ts/useMutate";
import { createPoll } from "@/services/admin";
import { useToast } from "@/hooks/use-toast";
import { AdvancedImage } from "@cloudinary/react";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

export type Outcome = {
  type: string;
  result: string;
};
export interface Poll {
  id: number;
  title: string;
  subtitle?: string;
  options: string[];
  expiry: Date | string;
  image?: string;
  outcome?: Outcome;
}
export const OPTIONS = ["Yes", "No"];
export const OUTCOME = {
  type: "NOT_DECLARED",
  result: "The option with the most votes will be the predicted outcome.",
};

const pollSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(60, "Title must be 100 characters or less"),
  subtitle: z
    .string()
    .max(150, "Subtitle must be 200 characters or less")
    .optional(),
  expiry: z
    .date({
      required_error: "Expiry date is required",
      invalid_type_error: "Expiry date must be a valid date",
    })
    .min(new Date(), "Expiry date must be in the future"),
  image: z.union([
    z.string().url("Must be a valid URL").optional(),
    z.instanceof(File).optional(),
  ]),
});

const CreatePoll = () => {
  //   const [polls, setPolls] = useState<Poll[]>([
  //     {
  //       id: 1,
  //       title: "Climate Change Action",
  //       subtitle: "Should we implement stricter environmental policies?",
  //       options: "yes/no",
  //       expiry: new Date(2023, 11, 31),
  //     },
  //     {
  //       id: 2,
  //       title: "Universal Basic Income",
  //       subtitle: "Do you support a UBI program?",
  //       options: "yes/no",
  //       expiry: new Date(2023, 10, 15),
  //     },
  //     {
  //       id: 3,
  //       title: "Space Exploration Funding",
  //       subtitle: "Should we increase budget for space missions?",
  //       options: "yes/no",
  //       expiry: new Date(2023, 9, 1),
  //     },
  //   ]);
  const { toast } = useToast();
  const { mutate: submitPoll, isLoading } = useMutate(createPoll, {
    onSuccess: (data) => {
      toast({
        title: "Poll created successfully",
        description: "Poll created successfully",
        duration: 9000,
        variant: "default",
        className: "bg-emerald-500",
      });
    },
  });
  const cld = new Cloudinary({
    cloud: {
      cloudName: "dkzaf7rpp",
    },
  });
  console.log(cld.getConfig().cloud?.cloudName);

  const handleFormSubmit = async (values: any) => {
    let imageUrl = values.image;

    // Check if the image is a file, if so, upload to Cloudinary
    if (values.image instanceof File) {
      const formData = new FormData();
      formData.append("file", values.image);
      formData.append("upload_preset", "bwzenc8n"); // Replace with your upload preset

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          cld.getConfig().cloud?.cloudName
        }/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      imageUrl = data.secure_url; // Get the uploaded image URL
    }
    const newPoll: Omit<Poll, "id"> = {
      title: values.title,
      subtitle: values.subtitle,
      options: OPTIONS,
      expiry: values.expiry.toISOString(),
      outcome: OUTCOME,
      image: imageUrl,
    };
    await submitPoll(newPoll);
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{
            title: "",
            subtitle: "",
            expiry: "",
            image: undefined as string | File | undefined,
          }}
          validationSchema={toFormikValidationSchema(pollSchema)}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            console.log(values);
            handleFormSubmit(values);
            // setPolls([...polls, newPoll]);
            setSubmitting(false);
            resetForm();
          }}
        >
          {({ isSubmitting, setFieldValue, values, errors }) => (
            <Form className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title" className="asterisk">
                  Title
                </Label>
                <Field
                  name="title"
                  as={Input}
                  className={errors.title ? "border-red-500" : ""}
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Field name="subtitle" as={Textarea} />
                <ErrorMessage
                  name="subtitle"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-2 flex flex-col flex-1">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex space-x-1">
                    <Input
                      id="imageUrl"
                      placeholder="Image URL"
                      onChange={(e) => setFieldValue("image", e.target.value)}
                      disabled={values.image instanceof File}
                    />
                    <div className="relative">
                      <Input
                        id="imageUpload"
                        type="file"
                        onChange={(e) => {
                          e.preventDefault();
                          console.log(e);
                          const file = e.target.files?.[0];
                          if (file) setFieldValue("image", file);
                        }}
                        className="hidden"
                        accept="image/*"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("imageUpload")?.click()
                        }
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload from Device
                      </Button>
                    </div>
                  </div>
                  <ErrorMessage
                    name="image"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
                <div className="space-y-2 flex flex-col items-end">
                  <div className="space-y-2 flex flex-col">
                    <Label htmlFor="expiry" className="asterisk items-start ">
                      Expiry Date
                    </Label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-72 justify-start text-left font-normal ${
                            !values.expiry && "text-muted-foreground"
                          } ${errors.expiry ? "border-red-500" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {values.expiry ? (
                            format(values.expiry, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <Field name="expiry">
                        {() => (
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={values.expiry as unknown as Date}
                              onSelect={(date) => setFieldValue("expiry", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        )}
                      </Field>
                    </Popover>
                    <ErrorMessage
                      name="expiry"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {values.image && (
                  <div className="mt-2 relative ">
                    <img
                      src={
                        values.image instanceof File
                          ? URL.createObjectURL(values.image)
                          : values.image
                      }
                      alt="Preview"
                      className="w-32 h-32 rounded "
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFieldValue("image", null);
                        const fileInput = document.getElementById(
                          "imageUpload"
                        ) as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = "";
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              {/* <div className="flex items-center">
                {values.image && (
                  <div className="mt-2 relative">
                    <AdvancedImage
                      cldImg={cld
                        .image(values.image instanceof File ? "" : values.image)
                        .format("auto")
                        .quality("auto")
                        .resize(
                          auto().gravity(autoGravity()).width(500).height(500)
                        )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFieldValue("image", null);
                        const fileInput = document.getElementById(
                          "imageUpload"
                        ) as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div> */}

              <Button type="submit" disabled={isSubmitting}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Poll
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default CreatePoll;
