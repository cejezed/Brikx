import FaqArticleLayout from '../FaqArticleLayout'
import { FAQ_ARTICLE_MAP } from '../faq-articles'

const article = FAQ_ARTICLE_MAP.get('hoe-maak-ik-een-realistisch-budget-voor-bouwen-of-verbouwen')

export const metadata = {
  title: article?.metaTitle,
  description: article?.metaDescription,
}

export default function FaqPage() {
  if (!article) return null
  return <FaqArticleLayout article={article} />
}
