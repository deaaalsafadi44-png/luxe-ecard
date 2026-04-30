"use client";

import { generateUploadButton } from "@uploadthing/react";
import type { AppFileRouter } from "@/app/api/uploadthing/core";

export const UploadThingButton = generateUploadButton<AppFileRouter>();
