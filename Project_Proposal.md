# Project Proposal: Student Organization Event and Attendance System

## 1. Project Overview
The **Student Organization Event and Attendance System** is a web-based platform designed to streamline event creation, member registration, and real-time attendance tracking for campus student organizations. By replacing manual paper sign-in sheets with a centralized digital portal, officers can efficiently manage event schedules and generate accurate participation records.

## 2. Objectives
* Provide student organization officers with a centralized dashboard to create, update, and manage campus events.
* Enable students to view upcoming events and log their attendance digitally.
* Maintain an organized, relational cloud database tracking users, events, and attendance logs.
* Eliminate manual data entry errors and simplify post-event participation reporting.

## 3. System Architecture & Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript (hosted via GitHub Pages / responsive web interface)
* **Backend:** Google Apps Script REST API (`doGet` and `doPost` endpoints handling JSON payloads)
* **Database:** Google Sheets (`IT37_EventAttendance_DB`) structured across three relational tables:
  * `Users` (`id`, `name`, `email`, `password`, `role`)
  * `Events` (`id`, `title`, `description`, `date`, `location`, `created_by`)
  * `Attendance` (`id`, `event_id`, `user_id`, `status`, `timestamp`)

## 4. Project Team (IT 37)
* Elritch Niño Balijon
* Arriz Gaurano
* Ramje Cataylo
* Paul John Cataylo
* Xander Sacbatona
* Gabriel Cadalso
* GM Alojado
* Ranjel Dunghao

## 5. Core Features
1. **Role-Based Authentication:** Separate access levels for Organization Officers (`admin`) and Students (`member`).
2. **Event Management (CRUD):** Officers can create new events, edit details, or cancel scheduled activities.
3. **Attendance Logging:** Students can check in to active events, automatically recording a timestamp and status (`Present`, `Late`, `Excused`).
4. **Attendance Reports:** Filterable attendance summaries per event for organization documentation.
