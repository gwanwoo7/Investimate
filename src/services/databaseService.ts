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
  oauthProvider?: 'google' | 'apple';
  oauthId?: string;
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
  async createUser(email: string, password: string, name: string, isSubscribed: boolean = false): Promise<User> {
    console.log('📝 Creating user:', { email, name, isSubscribed });
    const users = this.getUsers();
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      console.error('❌ User already exists:', email);
      throw new Error('User already exists');
    }

    const user: User = {
      id: this.generateId(),
      email,
      name,
      avatar: this.generateAvatar(name),
      isSubscribed,
      joinDate: new Date().toISOString(),
      hashedPassword: this.hashPasswordSync(password)
    };

    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    console.log('✅ User created successfully:', user.email, isSubscribed ? '(Pro Member)' : '(Free)');
    
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User> {
    console.log('🔐 Authenticating user:', email);
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ User not found:', email);
      throw new Error('User not found');
    }

    const hashedPassword = this.hashPasswordSync(password);
    if (user.hashedPassword !== hashedPassword) {
      console.error('❌ Invalid password for user:', email);
      throw new Error('Invalid password');
    }

    console.log('✅ User authenticated successfully:', email);
    
    // Don't return password hash
    const { hashedPassword: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return null;
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
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Get all users (admin method)
  getAllUsers(): User[] {
    return this.getUsers().map(user => {
      // Don't return password hash
      const { hashedPassword: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
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

  // Delete user (admin method)
  deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const initialLength = users.length;
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length < initialLength) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
      return true;
    }
    
    return false;
  }

  // Update user (admin method)
  updateUser(userId: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      // Update current user if it's the same user
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const updatedUser = { ...currentUser, ...updates };
        this.setCurrentUser(updatedUser);
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
  }  // Utility functions
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAvatar(name: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const color = colors[name.length % colors.length];
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="20" fill="${color}"/>
        <text x="20" y="25" font-family="Arial" font-size="16" font-weight="bold" text-anchor="middle" fill="white">${initials}</text>
      </svg>`
    )}`;
  }

  private async hashPassword(password: string): Promise<string> {
    // Enhanced hash for better demo security - in production use bcrypt
    let hash = 0;
    const salt = 'investimate_secure_salt_2025';
    const combinedString = salt + password + salt;
    
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private hashPasswordSync(password: string): string {
    // Enhanced hash for better demo security - in production use bcrypt
    console.log('🔒 Hashing password for security...');
    let hash = 0;
    const salt = 'investimate_secure_salt_2025';
    const combinedString = salt + password + salt;
    
    for (let i = 0; i < combinedString.length; i++) {
      const char = combinedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Consistent hash without timestamp for login verification
    const finalHash = Math.abs(hash).toString(16);
    console.log('✅ Password hashed successfully');
    return finalHash;
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

  // OAuth authentication methods
  async createOAuthUser(email: string, name: string, provider: 'google' | 'apple', oauthId: string, avatar?: string): Promise<User> {
    const users = this.getUsers();
    
    // Check if user already exists with this email or OAuth ID
    const existingUser = users.find(u => u.email === email || (u.oauthProvider === provider && u.oauthId === oauthId));
    if (existingUser) {
      // Update existing user with OAuth info if needed
      if (!existingUser.oauthProvider) {
        existingUser.oauthProvider = provider;
        existingUser.oauthId = oauthId;
        if (avatar) existingUser.avatar = avatar;
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      }
      return existingUser;
    }

    const newUser: User = {
      id: this.generateId(),
      email,
      name,
      avatar: avatar || this.generateAvatar(name),
      isSubscribed: false,
      joinDate: new Date().toISOString(),
      oauthProvider: provider,
      oauthId: oauthId
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return newUser;
  }

  async authenticateOAuthUser(provider: 'google' | 'apple', oauthId: string, email: string): Promise<User> {
    const users = this.getUsers();
    const user = users.find(u => u.oauthProvider === provider && u.oauthId === oauthId);
    
    if (!user) {
      throw new Error('OAuth user not found. Please sign up first.');
    }

    return user;
  }

  // Clear all data (for testing)
  clearAllData(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.POSTS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }
}

export default DatabaseService;
