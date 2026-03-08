import React from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { FlowDiagram } from "./pages/FlowDiagram";
import { RSSFeedSetup } from "./pages/RSSFeedSetup";
import { RSSFeedList } from "./pages/RSSFeedList";
import { ArticleQueue } from "./pages/ArticleQueue";
import { ArticleEdit } from "./pages/ArticleEdit";
import { AdminPublished } from "./pages/AdminPublished";
import { PublishedFeeds } from "./pages/PublishedFeeds";
import { ClientFeedEdit } from "./pages/ClientFeedEdit";
import { TakenDownFeeds } from "./pages/TakenDownFeeds";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "flow", Component: FlowDiagram },
      { path: "rss/setup", Component: RSSFeedSetup },
      { path: "rss/setup/:id", Component: RSSFeedSetup },
      { path: "rss/list", Component: RSSFeedList },
      
      // Articles (Admin Workspace)
      { path: "articles/queue", Component: ArticleQueue },
      { path: "articles/new", Component: ArticleEdit },
      { path: "articles/edit/:id", Component: ArticleEdit },
      { path: "articles/published", Component: AdminPublished },
      { path: "admin-feeds/:id", Component: ArticleEdit },
      
      // Published Articles (Client-Side Feeds)
      { path: "feeds/published", Component: PublishedFeeds },
      { path: "feeds/edit/:id", Component: ClientFeedEdit },
      { path: "feeds/taken-down", Component: TakenDownFeeds },
    ],
  },
]);
