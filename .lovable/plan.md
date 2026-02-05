
# Enhancement Plan: Dark Theme, Forum & Role System

## Overview
This plan adds three major features to KisaanMitra:
1. **Dark Theme Switch** - Toggle between light and dark modes
2. **Community Forum** - Reddit-style discussion platform for farmers
3. **Role-Based Access Control** - Admin, Farmer, and Seller roles with proper security

---

## Phase 1: Role System (Secure Implementation)

### Database Changes
Create a separate `user_roles` table following security best practices (roles MUST NOT be stored in profiles table to prevent privilege escalation):

```text
+-------------------+     +-------------------+
|   user_roles      |     |   app_role enum   |
+-------------------+     +-------------------+
| id (uuid)         |     | 'admin'           |
| user_id (ref auth)|     | 'farmer'          |
| role (app_role)   |     | 'seller'          |
| created_at        |     +-------------------+
+-------------------+
```

### Security Function
Create a `has_role()` security definer function to check roles without RLS recursion:

```text
has_role(user_id, role) -> boolean
- SECURITY DEFINER (bypasses RLS safely)
- Used in all RLS policies
```

### Admin Capabilities
- View all users and their roles
- Grant/revoke roles to any user
- Access to all forum posts (moderate)
- Access to user management page

### New Page: AdminDashboard.tsx
- User management table
- Role assignment dropdown
- Statistics overview

---

## Phase 2: Dark Theme Switch

### Implementation Approach
The app already has dark theme CSS variables defined in `index.css`. We'll use `next-themes` (already installed) to manage theme state.

### New Component: ThemeToggle.tsx
```text
+---------------------------+
|  [Sun/Moon Icon]          |
|  Toggle button in Header  |
+---------------------------+
```

### Changes Required
| File | Change |
|------|--------|
| `src/App.tsx` | Wrap with ThemeProvider |
| `src/components/layout/Header.tsx` | Add ThemeToggle button |
| `src/components/ui/ThemeToggle.tsx` | New component with Sun/Moon icons |
| `index.html` | Add script to prevent flash |

### Theme Persistence
- Saved to localStorage
- Respects system preference initially
- Smooth transition animation

---

## Phase 3: Community Forum

### Database Schema
```text
+-------------------+     +-------------------+     +-------------------+
|   forum_posts     |     |  forum_comments   |     |   forum_votes     |
+-------------------+     +-------------------+     +-------------------+
| id (uuid)         |     | id (uuid)         |     | id (uuid)         |
| user_id           |     | post_id           |     | user_id           |
| title             |     | user_id           |     | post_id (nullable)|
| content           |     | content           |     | comment_id        |
| category          |     | created_at        |     | vote_type (+1/-1) |
| image_url         |     +-------------------+     | created_at        |
| votes_count       |                               +-------------------+
| comments_count    |
| created_at        |
+-------------------+
```

### Forum Categories (Enum)
- crops - Crop-related discussions
- pests - Pest and disease problems
- market - Selling/buying tips
- weather - Weather discussions
- general - General farming topics

### New Pages
| Page | Purpose |
|------|---------|
| `Forum.tsx` | Main forum feed with filters |
| `ForumPost.tsx` | Individual post with comments |
| `CreatePost.tsx` | New post form |

### Forum Features
1. **Feed View** - Sorted by: Hot, New, Top
2. **Category Filters** - Filter by topic
3. **Upvote/Downvote** - Like Reddit
4. **Comments** - Nested replies
5. **User Attribution** - Show role badges (Farmer, Seller, Admin)
6. **Multilingual** - Post in any supported language

### New Components
```text
src/components/forum/
  ├── PostCard.tsx        # Forum post preview
  ├── CommentSection.tsx  # Comments list
  ├── VoteButtons.tsx     # Upvote/downvote
  ├── CategoryBadge.tsx   # Topic indicator
  └── RoleBadge.tsx       # User role display
```

---

## Phase 4: Navigation Updates

### Updated MobileNav
Add Forum to the 5-tab navigation:

```text
+--------------------------------------------------+
|  [Home]  [Chat]  [Forum]  [Shop]  [Profile]      |
+--------------------------------------------------+
   🏠       💬       👥       🛒       👤
```

### Header Updates
- Add theme toggle (Sun/Moon icon)
- Show admin badge for admins

---

## Phase 5: Translation Updates

### New Translation Keys
```text
// Theme
'theme.light': 'Light / लाइट / प्रकाश / ಬೆಳಕು'
'theme.dark': 'Dark / डार्क / गडद / ಡಾರ್ಕ್'

// Forum
'forum.title': 'Community / समुदाय / समुदाय / ಸಮುದಾಯ'
'forum.createPost': 'Create Post / पोस्ट बनाएं'
'forum.comments': 'Comments / टिप्पणियां'
'forum.upvote': 'Upvote / पसंद'
'forum.categories.*': [crops, pests, market, weather, general]

// Roles
'roles.admin': 'Admin / व्यवस्थापक'
'roles.farmer': 'Farmer / किसान'
'roles.seller': 'Seller / विक्रेता'

// Admin
'admin.title': 'Admin Panel / एडमिन पैनल'
'admin.manageUsers': 'Manage Users / उपयोगकर्ता प्रबंधित करें'
'admin.assignRole': 'Assign Role / भूमिका असाइन करें'
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/ui/ThemeToggle.tsx` | Dark/light toggle |
| `src/pages/Forum.tsx` | Forum main page |
| `src/pages/ForumPost.tsx` | Single post view |
| `src/pages/CreatePost.tsx` | New post creation |
| `src/pages/AdminDashboard.tsx` | Admin panel |
| `src/components/forum/PostCard.tsx` | Post preview |
| `src/components/forum/CommentSection.tsx` | Comments |
| `src/components/forum/VoteButtons.tsx` | Voting UI |
| `src/components/forum/CategoryBadge.tsx` | Category tag |
| `src/components/forum/RoleBadge.tsx` | Role indicator |
| `src/hooks/useUserRole.ts` | Role checking hook |

### Modified Files
| File | Changes |
|------|---------|
| `src/App.tsx` | Add ThemeProvider, Forum routes, Admin route |
| `src/components/layout/Header.tsx` | Add theme toggle |
| `src/components/layout/MobileNav.tsx` | Add Forum tab, dynamic for admin |
| `src/contexts/LanguageContext.tsx` | Add forum/admin translations |
| `src/contexts/AuthContext.tsx` | Remove role from Profile type (security) |

### Database Migration
- Create `app_role` enum (admin, farmer, seller)
- Create `user_roles` table with RLS
- Create `has_role()` security definer function
- Create `forum_posts`, `forum_comments`, `forum_votes` tables
- Create `forum_category` enum
- Add RLS policies for all new tables
- Seed initial admin user

---

## Security Considerations

### Role System
1. **Separate Table** - Roles stored in `user_roles`, NOT in profiles
2. **Security Definer** - `has_role()` function prevents RLS recursion
3. **Server-Side Validation** - Never trust client-side role checks
4. **RLS Policies** - All tables protected with proper policies

### Forum Security
1. **User Attribution** - Posts tied to authenticated users
2. **Edit/Delete** - Only post owner or admin can modify
3. **Rate Limiting** - Prevent spam (10 posts/hour)
4. **Content Moderation** - Admin can remove posts

### Admin Panel
1. **Protected Route** - Only accessible to admins
2. **Role Check** - Server-side verification via `has_role()`
3. **Audit Trail** - Log role changes (future enhancement)

---

## User Flow Examples

### Farmer Creates Post
1. Navigate to Forum tab
2. Tap "Create Post" button
3. Select category (e.g., "pests")
4. Write title and content
5. Optionally attach image
6. Submit -> Post appears in feed

### Admin Assigns Role
1. Login as admin
2. Navigate to Admin Dashboard
3. Search for user
4. Select role from dropdown
5. Confirm -> Role updated immediately

### Dark Mode Toggle
1. Tap moon icon in header
2. Theme switches instantly
3. Preference saved to localStorage
4. Persists across sessions

---

## Technical Architecture

```text
                    +------------------+
                    |   ThemeProvider  |
                    |  (next-themes)   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
    +---------v---------+         +---------v---------+
    |      Header       |         |     App Routes    |
    | (ThemeToggle)     |         +---------+---------+
    +-------------------+                   |
                               +------------+------------+
                               |            |            |
                        +------v--+   +-----v-----+  +---v---+
                        | Forum   |   | Admin     |  | ...   |
                        | Pages   |   | Dashboard |  |       |
                        +---------+   +-----------+  +-------+
```

---

## Implementation Priority

1. **Database Migration** - Create role system and forum tables
2. **Theme Toggle** - Quick win, visible improvement
3. **Role System** - Security foundation
4. **Forum Basic** - Posts and feed
5. **Forum Comments** - Engagement features
6. **Admin Dashboard** - User management
7. **Translations** - Multilingual support
