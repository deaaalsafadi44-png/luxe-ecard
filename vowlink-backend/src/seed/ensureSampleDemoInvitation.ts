import mongoose from "mongoose";
import { GuestModel } from "../models/Guest";
import { InvitationModel } from "../models/Invitation";
import { guestSlugFormatter } from "../utilities/GuestSlugFormatter";
import { inMemoryInvitationStore } from "../utilities/InMemoryInvitationStore";

const SAMPLE_SLUG = "sample-wedding";
const SAMPLE_GUEST_SLUG = "family-name";
const DEMO_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3388144.0!2d35.8517!3d33.8938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUzJzM3LjciTiAzNcKwNTEnMDYuMSJF!5e0!3m2!1sen!2sus!4v1";

const seedInMemory = () => {
  let invitation = inMemoryInvitationStore.getInvitationBySlug(SAMPLE_SLUG);
  if (!invitation) {
    invitation = inMemoryInvitationStore.createInvitation({
      coupleNames: "VowLink · Demo Couple",
      slug: SAMPLE_SLUG,
      weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      venueName: "Royal Garden Hall",
      venueAddress: "Beirut, Lebanon",
      mapEmbedUrl: DEMO_MAP_EMBED,
      galleryPhotoUrls: [],
      status: "PUBLISHED",
    });
  } else {
    inMemoryInvitationStore.updateInvitationBySlug(SAMPLE_SLUG, {
      status: "PUBLISHED",
    });
  }

  const normalizedGuest = guestSlugFormatter.normalize(SAMPLE_GUEST_SLUG);
  const existingGuest = inMemoryInvitationStore.getGuestBySlug(
    invitation._id,
    normalizedGuest,
  );
  if (!existingGuest) {
    inMemoryInvitationStore.addGuests(invitation._id, [
      {
        guestName: "Family Name",
        guestSlug: normalizedGuest,
        attendanceStatus: "PENDING",
        companionsCount: 0,
      },
    ]);
  }
};

const seedMongo = async () => {
  let invitation = await InvitationModel.findOne({ slug: SAMPLE_SLUG });
  if (!invitation) {
    invitation = await InvitationModel.create({
      coupleNames: "VowLink · Demo Couple",
      slug: SAMPLE_SLUG,
      weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      venueName: "Royal Garden Hall",
      venueAddress: "Beirut, Lebanon",
      mapEmbedUrl: DEMO_MAP_EMBED,
      galleryPhotoUrls: [],
      status: "PUBLISHED",
    });
  } else {
    await InvitationModel.updateOne(
      { slug: SAMPLE_SLUG },
      { $set: { status: "PUBLISHED" } },
    );
  }

  const normalizedGuest = guestSlugFormatter.normalize(SAMPLE_GUEST_SLUG);
  const existingGuest = await GuestModel.findOne({
    invitationId: invitation._id,
    guestSlug: normalizedGuest,
  });
  if (!existingGuest) {
    await GuestModel.create({
      invitationId: invitation._id,
      guestName: "Family Name",
      guestSlug: normalizedGuest,
    });
  }
};

export const ensureSampleDemoInvitation = async (): Promise<void> => {
  if (process.env.SEED_SAMPLE_INVITATION === "false") {
    return;
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      seedInMemory();
      // eslint-disable-next-line no-console
      console.log("Sample demo invitation ready (in-memory).");
      return;
    }

    await seedMongo();
    // eslint-disable-next-line no-console
    console.log("Sample demo invitation ready (MongoDB).");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Could not seed sample demo invitation:", error);
  }
};
