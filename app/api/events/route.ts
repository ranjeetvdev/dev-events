import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import { eventSchema } from "@/config/zod";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    const formData = await req.formData();

    const imageFile = formData.get("image") as File | null;

    if (!imageFile)
      return NextResponse.json(
        {
          message: "Image is required",
        },
        { status: 400 },
      );

    const parsedData = {
      ...Object.fromEntries(formData.entries()),
      agenda: JSON.parse((formData.get("agenda") as string) || "[]"),
      tags: JSON.parse((formData.get("tags") as string) || "[]"),
      image: imageFile,
    };

    const result = eventSchema.safeParse(parsedData);

    if (!result.success)
      return NextResponse.json(
        {
          message: "Validation Failed",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );

    // Convert file to buffer for Cloudinary upload
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload image to Cloudinary
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: "events" },
            (error, result) => {
              if (error) {
                reject(error);

                return;
              }

              if (!result) {
                reject(new Error("Cloudinary upload failed"));
                return;
              }

              resolve(result);
            },
          )
          .end(buffer);
      },
    );

    const createdEvent = await Event.create({
      ...result.data,
      image: uploadResult.secure_url,
    });

    return NextResponse.json(
      {
        message: "Event Created Successfully",
        event: createdEvent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Event creation error: ", error);

    return NextResponse.json(
      {
        message: "Event Creation Failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

export const GET = async () => {
  try {
    await connectDB();

    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      {
        message: "Events fetched successfully",
        events,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Event fetching failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
};
