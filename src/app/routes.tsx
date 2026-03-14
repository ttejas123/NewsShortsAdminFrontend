import React from "react";
import { createBrowserRouter } from "react-router";
import { AuthGuard } from "./components/AuthGuard";
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
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { UserManagement } from "./pages/UserManagement";
import { AdsManagement } from "./pages/AdsManagement";
import { SubscriptionManagement } from "./pages/SubscriptionManagement";
import { OAuthCallback } from "./pages/OAuthCallback";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/oauth/callback",
    Component: OAuthCallback,
  },
  {
    path: "/",
    Component: AuthGuard,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
      { path: "profile", Component: Profile },
      { path: "settings", Component: Settings },
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
      
      // Management
      { path: "users", Component: UserManagement },
      { path: "ads", Component: AdsManagement },
      { path: "subscriptions", Component: SubscriptionManagement },
      { path: "subscriptions/:userId", Component: SubscriptionManagement },
        ],
      },
    ],
  },
]);
