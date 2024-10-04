export interface AuthContextProps {
	message: string | null;
	user: any;
	loginUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
	logoutUser: () => void;
	updateToken: () => Promise<void>;
}

export interface AuthProviderProps {
	children: React.ReactNode;
}

export interface AuthTokens {
	access: string;
	refresh: string;
}

export interface User {
	token_type: string | null;
	exp: number | null;
	iat: number | null;
	jti: string | null;
	user_id: number | null;
	email: string | null; // todo: last 4 should not be null for production.
	first_name: string | null;
	last_name: string | null;
	phone: string | null;
}

export interface Hunt {
	id: number;
	name: string;
	description: string;
	start_date: string;
	end_date: string;
	created_at: string;
	poster_img: string;
	organizers: User[];
	participants: User[];
	slug: string;
}

export interface Puzzle {
	id: number;
	hunt: Hunt;
	name: string;
	description: string;
	answer: string;
	type: string;
	points: number;
}

export interface Announcement {
	id: number;
	hunt: Hunt;
	text: string;
	created_at: string;
	creator: User;
}

export interface Image {
	id: number;
	puzzle: Puzzle | null;
	hunt: Hunt | null;
	image: string;
}

export interface Rule {
	id: number;
	hunt: Hunt;
	rule: string;
	created_at: string;
}

interface UserData1 {
	name: string;
	email: string;
}

export interface TeamData {
	team_id: number;
	team_name: string;
	team_leader: string;
	team_members: UserData1[];
	team_points: number;
	team_puzzle_order: number[];
	team_password: string;
}


// src/types/types.ts

export interface Filters {
    content: string;
    title: string;
    startDate: Date | null;
    endDate: Date | null;
    tags: string[];
    isAlert: boolean | null;
}

// Update Post type in "../../types/types.ts"
export interface Comment {
	id: number;
	content: string;
	post: number;
	user: number;
	created_at: string;
	ratings: { id: number; user: number; value: number }[];
	parent_comment: number | null;
	upvotes: number;  // Add this field
	downvotes: number;  // Add this field
	userVote: "upvoted" | "downvoted" | null; // Add this field
  }
  
  export interface Post {
	id: number;
	user: number;
	title: string;
	content: string;
	created_at: string;
	tag_names: string[];
	upvotes: number;
	downvotes: number;
	comments: Comment[]; // Array of comments
  }

  export interface Tag {
	id: number;
	name: string;
  }
  




  