# UI Reorganization - Articles vs Published Articles

## 🎯 Overview

The admin UI has been reorganized to clearly separate:
- **Articles** (Admin workspace for creating/managing content)
- **Published Articles** (Client-side feeds visible to users)

---

## 📂 Navigation Structure

### **Articles** (Admin Workspace)
Path: `/articles/*`

1. **Article Queue** (`/articles/queue`)
   - Shows all admin feeds with status filters
   - Status pills: Draft, Review, Scheduled
   - Quick actions: Edit, Publish (Go Live), Delete
   - Single-click publish to make live

2. **New Article** (`/articles/new`)
   - Create new article with mobile preview
   - Full editor with all fields
   - Saves as draft initially

3. **Drafts** (`/articles/drafts`)
   - List of draft articles
   - Edit, Publish, Delete actions
   - Search functionality

4. **Published (Admin)** (`/articles/published`)
   - Articles published from admin panel
   - Currently live on client side
   - Edit via admin_feed_id

### **Published Articles** (Client-Side)
Path: `/feeds/*`

1. **Live Feeds** (`/feeds/published`)
   - All feeds visible to users (RSS + Admin)
   - Source badges: RSS / Admin
   - Edit or Take Down actions

2. **Taken Down** (`/feeds/taken-down`)
   - Feeds removed from client view
   - Can be restored
   - Shows source type

---

## 🔌 API Endpoints Used

### Admin Feeds APIs (`/api/admin-feeds/*`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin-feeds/queue` | GET | Get all admin feeds with filters |
| `/admin-feeds/drafts` | GET | Get draft articles |
| `/admin-feeds/drafts` | POST | Create new draft |
| `/admin-feeds/drafts/:id` | GET | Get draft by ID |
| `/admin-feeds/drafts/:id` | PUT | Update draft |
| `/admin-feeds/drafts/:id/publish` | POST | Publish draft (Go Live) |
| `/admin-feeds/drafts/:id` | DELETE | Delete draft |
| `/admin-feeds/published` | GET | Get published admin feeds |

### Client Feeds APIs (`/api/feed/*`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/feed` | GET | Get all published feeds |
| `/feed/id/:feedId` | GET | Get feed by ID |
| `/feed/id/:feedId` | PUT | Update feed |
| `/feed/id/:feedId/takedown` | POST | Take down feed |
| `/feed/id/:feedId/restore` | POST | Restore taken down feed |
| `/feed/taken-down` | GET | Get taken down feeds |

---

## 🎨 UI Components

### Article Queue
```
┌────────────────────────────────────────────────┐
│ Article Queue                   [New Article]  │
├────────────────────────────────────────────────┤
│ Filters: [Search] [Status: Draft/Review/Sched]│
├────────────────────────────────────────────────┤
│ ☐ Title                  [Draft]   Created     │
│                          [✏ Edit][📤 Publish][🗑]│
└────────────────────────────────────────────────┘
```

### Published Articles (Client)
```
┌────────────────────────────────────────────────┐
│ Live Feeds                                     │
├────────────────────────────────────────────────┤
│ Filters: [Search] [Language] [Source: RSS/Admin]│
├────────────────────────────────────────────────┤
│ ☐ [Img] Title     Provider  [RSS]    Published│
│                              [✏ Edit][⬇ Takedown]│
└────────────────────────────────────────────────┘
```

---

## 🔄 Workflows

### Create & Publish Article
```
1. Articles → New Article
2. Fill form with mobile preview
3. Click "Save Article" (saves as draft)
4. Articles → Queue
5. Click 📤 Publish icon
6. Confirm → Goes live to clients
7. Appears in:
   - Articles → Published (Admin)
   - Published Articles → Live Feeds
```

### Edit Draft from Queue
```
1. Articles → Queue
2. Click ✏ Edit icon
3. Make changes with mobile preview
4. Click "Save Article"
5. Still in draft state
6. OR click 📤 Publish to go live
```

### Edit Published Admin Article
```
1. Articles → Published (Admin)
2. Click article row or ✏ Edit
3. Edit via admin_feed_id
4. Changes reflected on client side
```

### Take Down Client Feed
```
1. Published Articles → Live Feeds
2. Click ⬇ Take Down
3. Confirm → Removed from client view
4. Moves to Taken Down section
5. Can be restored later
```

### Restore Taken Down Feed
```
1. Published Articles → Taken Down
2. Select feed(s)
3. Click "Restore"
4. Moves back to Live Feeds
5. Visible to clients again
```

---

## 📊 Status Pills

### Admin Feed Status
```typescript
draft      → Gray   (Initial state)
review     → Amber  (Under review)
scheduled  → Blue   (Scheduled to publish)
published  → Green  (Live on client)
```

### Source Badges (Client Feeds)
```typescript
RSS   → Blue badge   (Auto-generated from RSS)
Admin → Purple badge (Created by admin)
```

---

## 🎯 Key Features

### Single-Click Publish
- From Article Queue: Click 📤 icon
- Instantly publishes to client-side
- No additional steps required

### Mobile Preview
- Available in New Article and Edit
- Live preview as you type
- Shows realistic phone mockup
- 280px width with status bar

### Bulk Operations
- Select multiple items
- Bulk delete (drafts)
- Bulk restore (taken down feeds)

### Smart Filtering
- **Article Queue**: Status (draft/review/scheduled), Search
- **Live Feeds**: Language, Source Type (RSS/Admin), Search
- **Taken Down**: Search

---

## 🗂 File Structure

```
src/app/pages/
├── ArticleQueue.tsx        [NEW] Admin feed queue
├── ArticleEdit.tsx         [UPDATED] Create/edit articles
├── DraftArticles.tsx       [UPDATED] Draft list
├── AdminPublished.tsx      [NEW] Published admin articles
├── PublishedFeeds.tsx      [UPDATED] Client-side live feeds
├── ClientFeedEdit.tsx      [EXISTS] Edit client feeds
└── TakenDownFeeds.tsx      [NEW] Taken down feeds
```

---

## 🔧 Technical Details

### Pagination
- All lists use offset-based pagination
- Default: 20 items per page
- Previous/Next navigation

### API Error Handling
- Retry button on errors
- User-friendly error messages
- Console logging for debugging

### TypeScript Types
```typescript
interface DraftFeed {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  status?: "draft" | "review" | "scheduled";
  created_at?: string;
  updated_at?: string;
}

interface Feed {
  id: string;
  title: string;
  admin_feed_id?: string | null; // Link to admin_feeds
  deleted_at?: string | null;    // For taken down feeds
  // ... other fields
}
```

---

## ✅ Testing Checklist

### Article Queue
- [ ] Loads all admin feeds
- [ ] Status filter works (draft/review/scheduled)
- [ ] Search filters correctly
- [ ] Edit button navigates to editor
- [ ] Publish button publishes to client
- [ ] Delete button removes draft
- [ ] Pagination works

### New Article
- [ ] Form loads empty
- [ ] Mobile preview updates live
- [ ] Save creates draft
- [ ] Navigates to queue after save

### Drafts
- [ ] Lists all drafts
- [ ] Search works
- [ ] Edit navigates correctly
- [ ] Publish works
- [ ] Delete works

### Published (Admin)
- [ ] Lists published admin articles
- [ ] Search works
- [ ] Edit opens correct article
- [ ] Shows admin-created only

### Live Feeds
- [ ] Shows all published feeds
- [ ] Source badges correct (RSS/Admin)
- [ ] Language filter works
- [ ] Source type filter works
- [ ] Edit navigates correctly
- [ ] Take down removes from client

### Taken Down
- [ ] Shows taken down feeds
- [ ] Source badges visible
- [ ] Restore works (single)
- [ ] Bulk restore works
- [ ] Search works

---

## 🎉 Summary

The UI now clearly separates:
- **Admin workspace** (`/articles/*`) - Create, draft, publish
- **Client management** (`/feeds/*`) - Manage what users see

All endpoints checked and integrated correctly!
