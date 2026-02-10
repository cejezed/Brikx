import FaqArticleLayout from '../FaqArticleLayout'
import { FAQ_ARTICLE_MAP } from '../faq-articles'

const article = FAQ_ARTICLE_MAP.get('wat-zijn-je-rechten-als-opdrachtgever')

export const metadata = {
  title: article?.metaTitle,
  description: article?.metaDescription,
}

export default function FaqPage() {
  if (!article) return null
  return <FaqArticleLayout article={article} />
}
