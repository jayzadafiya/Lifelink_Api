import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  reviewText: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;
}
