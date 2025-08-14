// Simple local storage database service
// In production, replace with Firebase, Supabase, or your preferred backend

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  isSubscribed: boolean;
  joinDate: string;
  hashedPassword?: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  tags: string[];
  location?: string;
  propertyType?: string;
  category?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  likedBy: string[];
  replies?: Comment[];
}

class DatabaseService {
  private static instance: DatabaseService;
  private readonly USERS_KEY = 'investimate_users';
  private readonly POSTS_KEY = 'investimate_posts';
  private readonly CURRENT_USER_KEY = 'investimate_current_user';

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // User Management
  async createUser(email: string, password: string, name: string): Promise<User> {
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      throw new Error('User already exists');
    }

    const user: User = {
      id: this.generateId(),
      email,
      name,
      avatar: this.generateAvatar(name),
      isSubscribed: false,
      joinDate: new Date().toISOString(),
      hashedPassword: await this.hashPassword(password)
    };

    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await this.hashPassword(password);
    if (user.hashedPassword !== hashedPassword) {
      throw new Error('Invalid password');
    }

    // Don't return password hash
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      const { hashedPassword: _, ...userWithoutPassword } = user;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  getUsers(): User[] {
    const usersStr = localStorage.getItem(this.USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  updateUserSubscription(userId: string, isSubscribed: boolean): User | null {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].isSubscribed = isSubscribed;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, isSubscribed };
        this.setCurrentUser(updatedUser);
        return updatedUser;
      }
      
      return users[userIndex];
    }
    
    return null;
  }

  // Community Posts Management
  createPost(
    title: string, 
    content: string, 
    tags: string[] = [], 
    location?: string, 
    propertyType?: string
  ): CommunityPost {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Must be logged in to create posts');
    }

    const posts = this.getPosts();
    
    const newPost: CommunityPost = {
      id: this.generateId(),
      authorId: currentUser.id,
      author: currentUser.name,
      avatar: currentUser.avatar,
      title,
      content,
      tags,
      location,
      propertyType,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: []
    };

    posts.unshift(newPost); // Add to beginning
    localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
    
    return newPost;
  }

  getPosts(): CommunityPost[] {
    const postsStr = localStorage.getItem(this.POSTS_KEY);
    if (postsStr) {
      return JSON.parse(postsStr);
    }
    
    // Initialize with mock data if no posts exist
    const mockPosts = this.getMockPosts();
    localStorage.setItem(this.POSTS_KEY, JSON.stringify(mockPosts));
    return mockPosts;
  }

  getAllPosts(): CommunityPost[] {
    return this.getPosts();
  }

  likePost(postId: string, userId: string): CommunityPost | null {
    const posts = this.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      const post = posts[postIndex];
      
      if (post.likedBy.includes(userId)) {
        // Unlike
        post.likes--;
        post.likedBy = post.likedBy.filter(id => id !== userId);
      } else {
        // Like
        post.likes++;
        post.likedBy.push(userId);
      }
      
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
      return post;
    }
    
    return null;
  }

  addComment(postId: string, content: string): Comment | null {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Must be logged in to comment');
    }

    const posts = this.getPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      const newComment: Comment = {
        id: this.generateId(),
        postId: postId,
        authorId: currentUser.id,
        author: currentUser.name,
        avatar: currentUser.avatar,
        content: content,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };

      posts[postIndex].comments.push(newComment);
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
      
      return newComment;
    }
    
    return null;
  }  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateAvatar(name: string): string {
    const avatars = ['👤', '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', '👨‍🏫', '👩‍🏫'];
    const index = name.length % avatars.length;
    return avatars[index];
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for demo - use bcrypt or similar in production
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  private getMockPosts(): CommunityPost[] {
    return [
      {
        id: '1',
        authorId: 'mock1',
        author: 'Sarah Chen',
        avatar: '👩‍💼',
        title: 'Austin Market Update - Great Opportunities in East Austin',
        content: 'Just closed on a duplex in East Austin for $485K. Cash flow positive from day one! The area is gentrifying fast. Anyone else looking in this market?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 24,
        likedBy: [],
        comments: [
          {
            id: 'c1',
            postId: '1',
            authorId: 'mock2',
            author: 'Alex Thompson',
            avatar: '👨‍💼',
            content: 'Great insights! I\'ve been looking at similar properties in that area. What was your experience with the inspection process?',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            likes: 3,
            likedBy: []
          }
        ],
        tags: ['Austin', 'Duplex', 'Cash Flow'],
        location: 'Austin, TX',
        propertyType: 'Duplex',
        category: 'Market Update'
      },
      {
        id: '2',
        authorId: 'mock3',
        author: 'Mike Rodriguez',
        avatar: '👨‍💻',
        title: 'First-time Investor Questions - Birmingham AL',
        content: 'Looking at my first rental property. Found a SFH for $125K that rents for $1,200/mo. Numbers look good but worried about the neighborhood. Any Birmingham investors here?',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 15,
        likedBy: [],
        comments: [],
        tags: ['First Time', 'Birmingham', 'SFH'],
        location: 'Birmingham, AL',
        propertyType: 'Single Family',
        category: 'First Time Investor'
      }
    ];
  }

  // Clear all data (for testing)
  clearAllData(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.POSTS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }
}

export default DatabaseService;
