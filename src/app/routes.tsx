import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { FlowDiagram } from "./pages/FlowDiagram";
import { RSSFeedSetup } from "./pages/RSSFeedSetup";
import { RSSFeedList } from "./pages/RSSFeedList";
import { NewArticleQueue } from "./pages/NewArticleQueue";
import { ArticleEdit } from "./pages/ArticleEdit";
import { ReviewedArticleQueue } from "./pages/ReviewedArticleQueue";
import { ArticleArchive } from "./pages/ArticleArchive";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "flow", Component: FlowDiagram },
      { path: "rss/setup", Component: RSSFeedSetup },
      { path: "rss/list", Component: RSSFeedList },
      { path: "articles/queue", Component: NewArticleQueue },
      { path: "articles/edit/:id", Component: ArticleEdit },
      { path: "articles/edit", Component: ArticleEdit },
      { path: "articles/reviewed", Component: ReviewedArticleQueue },
      { path: "articles/archive", Component: ArticleArchive },
    ],
  },
]);
