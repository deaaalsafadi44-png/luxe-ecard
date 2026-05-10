import * as XLSX from "xlsx";

interface GuestRowRecord {
  guestName: string;
  guestSlug: string;
  attendanceStatus: string;
}

export const excelGuestExporter = {
  buildWorkbookBuffer(records: GuestRowRecord[]): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((record) => ({
        "Guest Name": record.guestName,
        "Guest Slug": record.guestSlug,
        "Attendance Status": record.attendanceStatus,
      })),
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RSVP Guests");

    return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
  },
};
