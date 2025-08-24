Disaster Relief Portal

A **mobile-first solution** built with **React Native**, **Node.js**, and **MongoDB** to help communities during disasters by providing **real-time alerts, safe evacuation routes, and shelter guidance**.

---
**Overview**

The Disaster Relief Portal warns people in danger zones and safely guides them to the nearest shelter.  
It combines **live incident reporting**, **real-time notifications**, and **map-based evacuation routes** with both **guest and registered user modes**.

---

**Features**

- **Incident Reporting** — agent-validated reports (demo allows uploads).
- **Real-time Notifications** — alerts for danger zones and pre-saved locations.
- **Interactive Map** — shows incidents, safe shelters, and evacuation routes.
- **Live Location Tracking** — keeps users locations up-to-date for instant alerts.
- **Incident Feed** — community posts with "real or fake" validation.
- **Profile Management** — JWT-secured authentication for users & guests.
- **Notification History** — registered users can view past incidents.
- **Admin Dashboard** — management of shelters, disaster types, posts and incidents. 

---

**Tech Stack**

- **Frontend (Mobile) - users ui**: React Native
- **Frontend (Web) - admin ui**: React 
- **Backend**: Node.js
- **Database**: MongoDB (Mongoose)
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Routing & Maps**: Google Maps API + OpenRouteService API

---
### Prerequisites
- MongoDB Atlas or local instance
- Firebase Project (for notifications)
- ORS API Key (for safe route calculations)




