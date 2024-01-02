import { IsUrl, IsArray, ArrayMinSize } from "class-validator";

export class CreateRepositoriesDto {
  @IsArray({ message: "links should be an array" }) //Specifies that the property should be an array
  @ArrayMinSize(1, { message: "links should not be an empty array" }) //Specifies that the array should have a minimum length of 1
  @IsUrl({}, { each: true, message: "link must be a URL address" }) //Specifies that each element of the array should be a valid URL address
  links: string[];
}
