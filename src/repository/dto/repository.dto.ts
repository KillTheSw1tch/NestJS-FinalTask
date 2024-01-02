// repository.dto.ts

import { IsUrl, IsNotEmpty, IsArray, ArrayMinSize } from "class-validator";

export class CreateRepositoriesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true, message: "link should not be empty" })
  @IsUrl({}, { each: true, message: "link must be a URL address" })
  links: string[];
}
