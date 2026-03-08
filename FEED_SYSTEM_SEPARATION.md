# Feed System Separation - Implementation Summary

## 🎯 Overview

Fixed the confusion between **Client-Side Feeds** (visible to users) and **Admin Feeds** (admin workspace). The system now properly distinguishes between:

1. **Client-Side Feeds** (`/api/feed/*`) - Published feeds visible to end users
2. **Admin Feeds** (`/api/admin-feeds/*`) - Admin workspace for drafts → publish workflow

---

## 📋 What Was Fixed

### 1. **API Client Updates** (`api.ts`)
Added new methods to properly separate concerns:

```typescript
// Client-Side Feeds (Published - Visible to Users)
getFeedById(id)            // GET /api/feed/id/:id
updateClientFeed(id, data) // PUT /api/feed/id/:id  
takeDownFeed(id)           // POST /api/feed/id/:id/take-down

// Admin Feeds (Admin Panel Only)
getAdminFeedById(id)       // GET /api/admin-feeds/feeds/:feedId
updateAdminFeed(id, data)  // PUT /api/admin-feeds/feeds/:feedId
```

### 2. **New Pages Created**

#### `PublishedFeeds.tsx` 
- Lists ALL published feeds (RSS + Admin generated)
- Filters: Search, Language, Source Type (RSS/Admin)
- Source badges: "RSS Generated" (blue) vs "Admin Generated" (purple)
- Actions: Edit, Take Down (soft delete from live)
- Click to preview with mobile mockup

#### `ClientFeedEdit.tsx`
- Edit published feeds visible to users
- **Mobile preview** in sidebar (as requested!)
- Simpler form (only client-facing fields)
- Take Down button (removes from live)
- Layout options: standardCard, photoDominant, textDominant, gallery

### 3. **Updated Pages**

#### `ArticleEdit.tsx` (Admin Feeds)
- Now has **mobile preview** sidebar (restored!)
- Uses admin endpoints (`/api/admin-feeds/feeds/:id`)
- Distinguishes between draft edits and published admin feed edits
- Correct layout options matching API

#### `Dashboard.tsx`
- Top 5 feeds preview now uses client-side feed endpoint
- Edit button navigates to `/feeds/edit/:id` (client-side edit)

---

## 🗂 File Structure

```
/feeds/published              → PublishedFeeds (All published feeds)
/feeds/edit/:id               → ClientFeedEdit (Edit client-side feed)

/articles/queue               → NewArticleQueue (Admin panel)
/articles/edit/:id            → ArticleEdit (Admin feed editor)
/articles/drafts              → DraftArticles
/articles/drafts/:id          → ArticleEdit (Edit draft)
/admin-feeds/:id              → ArticleEdit (Edit published admin feed)
```

---

## 🎨 UI Updates

### Published Feeds Page
```
┌─────────────────────────────────────────────────┐
│ Published Feeds (Client-Side)                   │
├─────────────────────────────────────────────────┤
│ Filters: [Search] [Language] [Source Type]     │
├─────────────────────────────────────────────────┤
│ ☐ [Img] Title     Provider  [RSS Generated]    │
│ ☐ [Img] Title     Provider  [Admin Generated]  │
└─────────────────────────────────────────────────┘
```

### Client Feed Editor (with Mobile Preview!)
```
┌──────────────────────────┬─────────────────┐
│ Feed Editor (2 cols)     │  Mobile Preview │
│                          │  ┌───────────┐  │
│ Title:                   │  │ 3:49 PM  │  │
│ Subtitle:                │  ├───────────┤  │
│ Description:             │  │ [Image]  │  │
│ HTML:                    │  │ Title    │  │
│ ...                      │  │ Desc     │  │
│                          │  └───────────┘  │
│ [Take Down] [Cancel][Save]│                │
└──────────────────────────┴─────────────────┘
```

### Admin Article Editor (with Mobile Preview!)
```
┌──────────────────────────┬─────────────────┐
│ Article Editor (2 cols)  │  Mobile Preview │
│                          │  ┌───────────┐  │
│ Title:                   │  │ 3:49 PM  │  │
│ Subtitle:                │  ├───────────┤  │
│ Description:             │  │ [Image]  │  │
│ HTML:                    │  │ Title    │  │
│ Provider, Author, etc.   │  │ Desc     │  │
│                          │  └───────────┘  │
│ [Archive] [Cancel] [Save]│                │
└──────────────────────────┴─────────────────┘
```

---

## 🔄 Data Flow

### RSS-Generated Feed Flow
```
RSS Source → Fetched → feeds table → Visible to users
                           ↓
                     Can be edited
                     Can be taken down
```

### Admin-Generated Feed Flow
```
Draft → admin_feeds (draft) 
   ↓
Publish → feeds table + admin_feed_id link
             ↓
       Visible to users
       Can be edited (updates admin_feeds)
       Can be taken down (soft delete from feeds)
```

---

## 🏷 Source Type Badges

The `PublishedFeeds` page shows badges to distinguish:

```typescript
if (feed.admin_feed_id) {
  return <Badge color="purple">Admin Generated</Badge>
}
return <Badge color="blue">RSS Generated</Badge>
```

---

## 🔧 Key Technical Details

### Feed Type Update
```typescript
export interface Feed {
  // ... existing fields
  admin_feed_id?: string | null;  // NEW: Links to admin_feeds table
}
```

### Take Down vs Archive
- **Take Down** (`/api/feed/id/:id/take-down`): Removes from client-side (soft delete)
- **Archive** (`/api/admin-feeds/feeds/:id/soft-delete`): Admin panel archive

### Layout Options
Updated to match API:
- `standardCard`
- `photoDominant`
- `textDominant`
- `gallery`

---

## 📱 Mobile Preview Restoration

Both editors now have the mobile preview sidebar showing:
- Phone mockup (280px width)
- Status bar with time
- Cover image
- Title, subtitle, description
- Layout and engagement score
- Home button

---

## 🎯 Navigation Updates

```
Dashboard
Flow Diagram
RSS Feeds
  ├─ Setup New Feed
  └─ Manage Feeds
Articles (Admin Workspace)
  ├─ New Queue
  ├─ Article Edit
  ├─ Drafts
  ├─ Reviewed Queue
  └─ Archive
Published Feeds (Client-Side) ← NEW!
```

---

## ✅ Issues Fixed

1. ✅ **Mobile Preview Missing** - Restored in both editors
2. ✅ **Preview Section Error** - Fixed endpoint to use `/api/feed/id/:id`
3. ✅ **Admin Feed Edit Error** - Now uses `/api/admin-feeds/feeds/:id`
4. ✅ **Published Feeds Page** - Created with RSS/Admin filters

---

## 🚀 Usage Guide

### Editing from Dashboard
1. Dashboard shows top 5 feeds (client-side)
2. Click feed → Preview modal
3. Click "Edit Article" → Opens `ClientFeedEdit` (for client-side feeds)

### Admin Workflow
1. Create draft → `/articles/drafts`
2. Edit draft → `/articles/drafts/:id`
3. Publish → Goes to `feeds` table
4. Edit published admin feed → `/admin-feeds/:id`

### Managing Published Feeds
1. Go to **Published Feeds** page
2. See all feeds (RSS + Admin)
3. Filter by source type
4. Edit → Updates the feed
5. Take Down → Removes from live

---

## 🎨 Visual Differences

| Feature | Admin Feeds | Published Feeds |
|---------|-------------|-----------------|
| **Purpose** | Admin workspace | User-facing content |
| **Create** | Drafts system | N/A (created via publish/RSS) |
| **Edit** | Full form with all fields | Simplified form |
| **Delete** | Archive (admin panel only) | Take Down (from live) |
| **Source Badge** | N/A | RSS/Admin badge |
| **Mobile Preview** | ✅ Yes | ✅ Yes |

---

## 📚 Documentation

All endpoints are documented in the API routes:
- Client-Side Feeds: `/api/feed/*`
- Admin Feeds: `/api/admin-feeds/*`

---

## 🎉 Summary

**Everything is now working correctly:**
- ✅ Separate client-side and admin feed management
- ✅ Mobile preview restored in both editors
- ✅ Correct API endpoints for each context
- ✅ Published Feeds page with RSS/Admin filtering
- ✅ Dashboard preview navigates to correct editor
- ✅ Source type badges show generation method

**The system now properly separates concerns while maintaining a consistent UI!**
