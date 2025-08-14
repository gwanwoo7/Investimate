import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Collapse,
  Alert
} from '@mui/material';
import { 
  MessageCircle, 
  ThumbsUp, 
  Reply, 
  TrendingUp,
  DollarSign,
  MapPin,
  Send,
  Users
} from 'lucide-react';
import DatabaseService, { type CommunityPost, type Comment } from '../services/databaseService';

export default function CommunityChat() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const db = DatabaseService.getInstance();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const allPosts = await db.getAllPosts();
      setPosts(allPosts);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    }
  };

  const categories = ['Property Analysis', 'Market Update', 'First Time Investor', 'Property Management', 'Financing', 'General Discussion'];
  const availableTags = ['Austin', 'Tampa', 'Birmingham', 'Cash Flow', 'ROI', 'SFH', 'Duplex', 'Condo', 'First Time', 'Lessons Learned'];

  const handleLike = async (postId: string) => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
      setError('Please log in to like posts');
      return;
    }

    try {
      await db.likePost(postId, currentUser.id);
      await loadPosts(); // Reload posts to update like counts
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleCreatePost = async () => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
      setError('Please log in to create posts');
      return;
    }

    if (!newPost.trim() || !newPostTitle.trim()) {
      setError('Title and content are required');
      return;
    }
    
    try {
      await db.createPost(
        newPostTitle.trim(),
        newPost.trim(),
        selectedTags,
        selectedTags.find(tag => tag.includes('TX') || tag.includes('FL') || tag.includes('AL')),
        selectedTags.find(tag => ['SFH', 'Duplex', 'Condo'].includes(tag))
      );

      setNewPost('');
      setNewPostTitle('');
      setSelectedCategory('');
      setSelectedTags([]);
      setError('');
      await loadPosts(); // Reload posts after creating
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
      setError('Please log in to comment');
      return;
    }

    const content = newComment[postId]?.trim();
    if (!content) {
      return;
    }

    try {
      await db.addComment(postId, content);
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      await loadPosts(); // Reload posts to update comments
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const currentUser = db.getCurrentUser();

  return (
    <Box sx={{ 
      height: '100%',
      overflow: 'auto',
      p: 3,
      maxWidth: 800,
      mx: 'auto',
      width: '100%',
      bgcolor: 'background.default'
    }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2,
          fontWeight: 'bold'
        }}>
          <Users size={32} />
          Investment Community
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Connect with fellow real estate investors, share insights, and learn from the community.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Create New Post */}
      {currentUser ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Share Your Insights
            </Typography>
            
            <TextField
              fullWidth
              label="Post Title"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <FormControl sx={{ mb: 2, minWidth: 200, mr: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Add Tags:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    clickable
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    onClick={() => toggleTag(tag)}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>
            
            <Button
              variant="contained"
              onClick={handleCreatePost}
              disabled={!newPost.trim() || !newPostTitle.trim()}
              startIcon={<Send size={20} />}
            >
              Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info" sx={{ mb: 4 }}>
          Please log in to create posts and join the discussion.
        </Alert>
      )}

      {/* Posts Feed */}
      <Stack spacing={3}>
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent>
              {/* Post Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>{post.avatar}</Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.author}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(post.timestamp)}
                    {post.location && (
                      <>
                        {' • '}
                        <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {post.location}
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Post Content */}
              <Typography variant="h6" gutterBottom>
                {post.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.content}
              </Typography>

              {/* Tags */}
              {post.tags.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                </Stack>
              )}

              {/* Property Type */}
              {post.propertyType && (
                <Chip 
                  icon={<DollarSign size={16} />}
                  label={post.propertyType}
                  color="success"
                  size="small"
                  sx={{ mb: 2 }}
                />
              )}

              {/* Post Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  startIcon={<ThumbsUp size={16} />}
                  onClick={() => handleLike(post.id)}
                  size="small"
                  disabled={!currentUser}
                >
                  {post.likes}
                </Button>
                <Button
                  startIcon={<MessageCircle size={16} />}
                  onClick={() => toggleComments(post.id)}
                  size="small"
                >
                  {post.comments.length}
                </Button>
              </Box>

              {/* Comments Section */}
              <Collapse in={expandedComments.includes(post.id)}>
                <Divider sx={{ my: 2 }} />
                
                {/* Add Comment */}
                {currentUser && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Add a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment(prev => ({
                        ...prev,
                        [post.id]: e.target.value
                      }))}
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <IconButton 
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            size="small"
                          >
                            <Send size={16} />
                          </IconButton>
                        )
                      }}
                    />
                  </Box>
                )}

                {/* Comments List */}
                <Stack spacing={2}>
                  {post.comments.map((comment) => (
                    <Box key={comment.id} sx={{ display: 'flex', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.avatar}
                      </Avatar>
                      <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold">
                          {comment.author}
                        </Typography>
                        <Typography variant="body2">
                          {comment.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(comment.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {posts.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No posts yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentUser 
                ? "Be the first to share your investment insights!" 
                : "Log in to see posts and join the discussion."
              }
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
