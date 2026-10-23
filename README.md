# Missing People Tracker and Finder System

A full-stack, responsive, and privacy-safeguarded web application designed to help families, the public, search volunteers, and authorized investigators report missing persons, search verified cases, submit community sightings, and coordinate official investigations responsibly.

---

## 1. Key Features

- **Public Case Directory & Advanced Filtering**: Search by name, official reference code (`MPT-YYYY-XXXX`), age range, city, state, priority, and date last seen.
- **Pre-Publication Administrative Verification**: New cases filed by families automatically enter `Pending Review` status with private visibility until verified against law enforcement filings by an authorized administrator.
- **Confidential Community Sightings System**: Citizens submit observations with date, time, location, and photos. Witness identities and phone numbers are strictly segregated and shielded from public disclosure.
- **Role-Based Access Control (RBAC)**:
  - **Public Visitor**: Searches public registry, views approved dossiers, and submits sighting tips.
  - **Registered Reporter**: Files missing person reports, updates physical identifiers, withdraws cases, and receives status notifications.
  - **Investigator**: Manages assigned cases, reviews civilian sightings, dispatches units, adds confidential notes, and updates lead statuses.
  - **Administrator**: Moderates the intake queue, approves or rejects reports with mandatory justification, assigns investigators, manages user roles, reviews potential duplicate cases, and inspects immutable audit logs.
- **Geographic Map Integration**: Interactive Leaflet / OpenStreetMap visualization with privacy protection (approximate landmarks with jitter to avoid disclosing domestic residences).
- **Dual Persistence Architecture**:
  - **Cloud Firestore**: Live Google Cloud Firestore with Attribute-Based Access Control (ABAC) and security rules.
  - **Standalone Storage Engine**: Out-of-the-box local persistence with realistic relational tables, simulated network delays, and pre-seeded realistic cases—allowing instant local testing without cloud billing.

---

## 2. Technology Stack

- **Frontend**: React 19, TypeScript, Vite.
- **Styling**: Tailwind CSS v4.
- **Icons**: Lucide React.
- **Database & Auth**: Cloud Firestore & Firebase Authentication (`firebase` SDK v11).
- **Mapping**: Leaflet with OpenStreetMap tiles.
- **Testing**: Vitest automated test suite (`src/tests/system.test.ts`).

---

## 3. Project File Structure

```
├── .env.example                     # Environment variable documentation
├── firebase.json                    # Firebase deployment config
├── firestore.rules                  # Hardened ABAC security rules
├── firestore.indexes.json           # Composite database indexes
├── storage.rules                    # Secure Cloud Storage rules
├── firebase-blueprint.json          # Intermediate schema blueprint
├── index.html                       # Entry HTML with Leaflet CSS & metadata
├── metadata.json                    # AI Studio applet metadata
├── package.json                     # Node dependencies & build scripts
├── src/
│   ├── App.tsx                      # Root shell & client-side router
│   ├── main.tsx                     # React DOM entry point
│   ├── index.css                    # Tailwind CSS v4 styles
│   ├── types/
│   │   └── index.ts                 # Core TypeScript data contracts
│   ├── data/
│   │   └── seedData.ts              # Verified fictional seed cases, sightings & notes
│   ├── lib/
│   │   ├── database.ts              # Unified Database Engine & persistence
│   │   └── firebase.ts              # Firebase client SDK initialization & error handler
│   ├── context/
│   │   ├── AuthContext.tsx          # Authentication state & one-click persona switcher
│   │   └── DataContext.tsx          # Real-time state management, CRUD & audit triggers
│   ├── components/
│   │   ├── common/                  # Badges, modals & status indicators
│   │   ├── layout/                  # Navbar with persona switcher & Footer
│   │   └── map/                     # Leaflet OpenStreetMap component
│   ├── pages/                       # 18 fully implemented application pages
│   └── tests/
│       └── system.test.ts           # Automated test suite
```

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js 18+ or Node.js 20+
- npm or yarn

### Installation
```bash
# Clone the repository and install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser. The application will start immediately in **Standalone Persistence Mode** pre-loaded with realistic fictional cases, active sightings, and 4 test personas.

---

## 5. Connecting to Live Firebase

To connect the application to your own live Firebase project:

1. Visit [Firebase Console](https://console.firebase.google.com) and create a new project.
2. Under **Build > Firestore Database**, click **Create database**.
3. Under **Build > Authentication**, enable **Email/Password** and **Google Sign-In**.
4. Go to **Project Settings > General > Your Apps**, select **Web**, and register the app.
5. In your local `.env` file (copied from `.env.example`), paste your credentials:
   ```env
   VITE_FIREBASE_API_KEY="AIzaSy..."
   VITE_FIREBASE_AUTH_DOMAIN="my-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="my-project"
   VITE_FIREBASE_STORAGE_BUCKET="my-project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
   VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
   ```
6. Alternatively, click the **Storage Status** pill in the top navigation bar to open the in-app configuration modal and paste your config JSON directly.
7. Deploy rules and indexes:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

---

## 6. Testing Personas for Evaluators

The application includes a **Persona Switcher** in the top navigation bar to test all user roles instantly without manual logins:

| Persona | Role | Capabilities |
| :--- | :--- | :--- |
| **Public Visitor** | `public` | Browse approved cases, search, view public profiles, submit sighting leads anonymously. |
| **Sarah Jenkins** | `reporter` | File new missing person cases, monitor review status in My Reports, request edits, withdraw cases. |
| **Det. Elena Ramirez** | `investigator` | View assigned cases, evaluate civilian sighting leads, read unredacted witness details, record confidential notes. |
| **Chief Miller** | `admin` | Full moderation queue, approve/reject reports with required rationale, assign investigators, inspect immutable audit logs. |

---

## 7. Manual Testing Checklist

- [x] **Search & Filters**: Type "Maya" in the search box; filter by age range or state (e.g., Colorado).
- [x] **File a Report**: Switch to Sarah Jenkins, navigate to `/report`, complete the 4 steps, upload a photo, and submit. Verify it lands in `Pending Review`.
- [x] **Admin Verification**: Switch to Chief Miller, go to `/admin`, inspect the Pending Queue, and click **Approve & Publish**.
- [x] **Submit Sighting**: Switch to Public Visitor, open the newly approved case, submit a sighting tip, and verify witness data is hidden from public view.
- [x] **Investigator Lead Review**: Switch to Det. Ramirez, navigate to `/investigator`, evaluate the sighting, and add a confidential detective note.
- [x] **Geographic Map**: Navigate to `/map`, click on map markers, and test region filters.
- [x] **Audit Trail**: Open Admin Dashboard > System Audit Logs to verify that every status transition is recorded with timestamp and user ID.

---

## 8. License & Safety Disclaimer

This project is built for public safety and investigation coordination. All demonstration names and photographs are fictional and licensed for demonstration. False reporting of missing persons is a serious violation of criminal law.
