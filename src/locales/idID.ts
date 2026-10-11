import { idID as naiveIdID, dateIdID } from "naive-ui";
import type { NLocale, NDateLocale } from "naive-ui";

// Gunakan locale Bahasa Indonesia bawaan naive-ui secara utuh.
// (Locale custom yang hanya sebagian dapat membuat komponen seperti
// DatePicker gagal render karena key-nya tidak lengkap.)
export const idID = naiveIdID as NLocale;
export const dateId = dateIdID as NDateLocale;
