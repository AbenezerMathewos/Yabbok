import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion {
  id: string;
  questionEn: string;
  questionAm: string;
  optionsEn: string[];
  optionsAm: string[];
  correctIndex: number;
  explanationEn: string;
  explanationAm: string;
  points: number;
}

export interface IQuiz extends Document {
  titleEn: string;
  titleAm: string;
  category: string;
  passage: string;
  questions: IQuizQuestion[];
  badgeUnlocked?: string;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  titleEn: { type: String, required: true },
  titleAm: { type: String, required: true },
  category: { type: String, default: "Bible Knowledge" },
  passage: { type: String, default: "" },
  questions: [
    {
      id: { type: String, required: true },
      questionEn: { type: String, required: true },
      questionAm: { type: String, required: true },
      optionsEn: [{ type: String, required: true }],
      optionsAm: [{ type: String, required: true }],
      correctIndex: { type: Number, required: true },
      explanationEn: { type: String, default: "" },
      explanationAm: { type: String, default: "" },
      points: { type: Number, default: 10 },
    },
  ],
  badgeUnlocked: { type: String, default: "Bible Scholar" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", QuizSchema);
