import { permanentRedirect } from "next/navigation";

// The report form moved to "/" (the main tab). Keep old links working.
export default function ReportFormRedirect() {
  permanentRedirect("/");
}
