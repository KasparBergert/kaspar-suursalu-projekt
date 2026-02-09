

API design<br>
_View image in directory_

Tech stack

- prisma
- vue
- express.js
- bun

---

# MVP goal
A minimal Q&A platform where users can ask questions, answer them, and vote on content. No advanced moderation, recommendation, or gamification features.

Core functionality
## Authentication
Users can create an account using email and password, log in, and log out. No password recovery.

## User profiles
Each user has a simple profile containing a username/display name and a list of questions they have asked. No profile customization or follower system.

## Asking questions
Authenticated users can create a question consisting of a title and body text. Questions are stored and publicly visible.

## Question listing
The home page displays all questions in reverse chronological order (highest votes first). Users can upvote questions to signal relevance.

## Answering questions
Authenticated users can submit answers on a question’s detail page. Answers are stored in the database and linked to the question and author.

## Viewing answers
Each question page shows all submitted answers, including author name and timestamp. No sorting beyond default order.

## Voting
Users can upvote (optionally downvote) both questions and answers. Vote counts are displayed, with basic prevention of multiple votes per user.

## Navigation
Basic navigation includes:

##Home (question list)
Ask Question
Profile
Log in / Log out

Explicit non-goals (out of MVP scope)
No tags, comments, moderation tools, notifications, search, ranking algorithms, badges, reputation system, or content recommendations.

