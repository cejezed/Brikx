import FaqArticleLayout from '../FaqArticleLayout'
import { FAQ_ARTICLE_MAP } from '../faq-articles'

const article = FAQ_ARTICLE_MAP.get('wat-zijn-verborgen-kosten-waar-mensen-niet-aan-denken')

export const metadata = {
  title: article?.metaTitle,
  description: article?.metaDescription,
}

export default function FaqPage() {
  if (!article) return null
  return <FaqArticleLayout article={article} />
}
