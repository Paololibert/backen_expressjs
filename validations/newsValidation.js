import vine from "@vinejs/vine";
import { CustomErrorReporter } from "./CustomErrorReporter.js";



// * Custom Error Reporter
vine.errorReporter = () => new CustomErrorReporter();

export const newsSchema = vine.object({
  title: vine.string().minLength(5).maxLength(200),
  content: vine.string().maxLength(3000),
});
