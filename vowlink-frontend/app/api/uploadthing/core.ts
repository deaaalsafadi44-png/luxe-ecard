import { createUploadthing, type FileRouter } from "uploadthing/next";

const uploadBuilder = createUploadthing();

export const appFileRouter = {
  invitationPhotos: uploadBuilder({
    image: { maxFileSize: "8MB", maxFileCount: 8 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedUrl: file.url };
  }),
  /** Gallery: multiple images per batch; URLs stored on the invitation. */
  galleryPhotos: uploadBuilder({
    image: { maxFileSize: "8MB", maxFileCount: 12 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedUrl: file.url };
  }),
  /** Full-screen story background slideshow (same limits as gallery). */
  experienceBgPhotos: uploadBuilder({
    image: { maxFileSize: "8MB", maxFileCount: 12 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedUrl: file.url };
  }),
  /** Full-screen story background video (replaces slideshow when set). */
  experienceBgVideo: uploadBuilder({
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedUrl: file.url };
  }),
  /** Background music: audio files or MP4 (often used for music-only exports). */
  invitationAudio: uploadBuilder({
    audio: { maxFileSize: "32MB", maxFileCount: 1 },
    video: { maxFileSize: "64MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return { uploadedUrl: file.url };
  }),
} satisfies FileRouter;

export type AppFileRouter = typeof appFileRouter;
