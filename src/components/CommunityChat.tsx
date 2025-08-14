import { useState } from 'react';
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
  Collapse
} from '@mui/material';
import { 
  MessageCircle, 
  ThumbsUp, 
  Reply, 
  TrendingUp,
  DollarSign,
  MapPin,
  Send
} from 'lucide-react';

// interface Comment {
//   id: string;
//   author: string;
//   avatar: string;
//   content: string;
//   timestamp: string;
//   likes: number;
//   replies?: Comment[];
//   tags?: string[];
// }

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  location?: string;
  propertyType?: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    avatar: '👩‍💼',
    title: 'Austin Market Update - Great Opportunities in East Austin',
    content: 'Just closed on a duplex in East Austin for $485K. Cash flow positive from day one! The area is gentrifying fast. Anyone else looking in this market?',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    tags: ['Austin', 'Duplex', 'Cash Flow'],
    location: 'Austin, TX',
    propertyType: 'Duplex'
  },
  {
    id: '2',
    author: 'Mike Rodriguez',
    avatar: '👨‍💻',
    title: 'First-time Investor Questions - Birmingham AL',
    content: 'Looking at my first rental property. Found a SFH for $125K that rents for $1,200/mo. Numbers look good but worried about the neighborhood. Any Birmingham investors here?',
    timestamp: '4 hours ago',
    likes: 15,
    comments: 12,
    tags: ['First Time', 'Birmingham', 'SFH'],
    location: 'Birmingham, AL',
    propertyType: 'Single Family'
  },
  {
    id: '3',
    author: 'Jennifer Walsh',
    avatar: '👩‍🏫',
    title: 'Property Management Horror Story - Learn from my mistakes',
    content: 'Hired a property management company that charged 12% and did terrible work. Tenant complaints ignored, maintenance delayed. Going self-managed now. Any tips for beginners?',
    timestamp: '6 hours ago',
    likes: 31,
    comments: 18,
    tags: ['Property Management', 'Lessons Learned'],
  },
  {
    id: '4',
    author: 'David Kim',
    avatar: '👨‍🔬',
    title: 'Tampa Bay Rental Market - ROI Analysis',
    content: 'Been tracking Tampa Bay for 6 months. Cap rates averaging 6-8% for SFH. Condos are trickier due to HOA fees. Built a spreadsheet to compare 50+ properties. Happy to share insights!',
    timestamp: '8 hours ago',
    likes: 42,
    comments: 25,
    tags: ['Tampa', 'ROI', 'Market Analysis'],
    location: 'Tampa, FL',
    propertyType: 'Mixed'
  }
];

export default function CommunityChat() {
  const [newPost, setNewPost] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posts, setPosts] = useState(mockPosts);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);

  const categories = ['Property Analysis', 'Market Update', 'First Time Investor', 'Property Management', 'Financing', 'General Discussion'];
  const availableTags = ['Austin', 'Tampa', 'Birmingham', 'Cash Flow', 'ROI', 'SFH', 'Duplex', 'Condo', 'First Time', 'Lessons Learned'];

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim() || !newPostTitle.trim()) return;
    
    const newPostData: Post = {
      id: (posts.length + 1).toString(),
      author: 'You',
      avatar: '👤',
      title: newPostTitle,
      content: newPost,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      tags: selectedTags,
      location: selectedTags.find(tag => tag.includes('TX') || tag.includes('FL') || tag.includes('AL')),
      propertyType: selectedTags.find(tag => ['SFH', 'Duplex', 'Condo'].includes(tag))
    };
    
    setPosts([newPostData, ...posts]);
    setNewPost('');
    setNewPostTitle('');
    setSelectedCategory('');
    setSelectedTags([]);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getTagColor = (tag: string) => {
    if (tag.includes('TX') || tag.includes('FL') || tag.includes('AL')) return 'primary';
    if (tag.includes('Cash Flow') || tag.includes('ROI')) return 'success';
    if (tag.includes('First Time')) return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      overflowY: 'auto',
      bgcolor: 'background.default',
      px: { xs: 2, sm: 4, md: 6, lg: 8 },
      py: { xs: 2, md: 4 }
    }}>
      {/* Community Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          💬 Investor Community
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Connect with fellow rental property investors, share insights, and learn from experiences
        </Typography>
      </Box>

      {/* Centered container with max width and side spacing */}
      <Box sx={{ 
        maxWidth: '800px', 
        mx: 'auto',
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        {/* Create Post */}
        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.light' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Share Your Experience
            </Typography>
            <TextField
              fullWidth
              placeholder="Post title..."
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Share a deal, ask a question, or discuss market trends..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              sx={{ mb: 2 }}
            />
            
            {/* Category Selection */}
            <FormControl sx={{ minWidth: 200, mb: 2, mr: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tags Selection */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Select relevant tags:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {availableTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleTagToggle(tag)}
                    color={selectedTags.includes(tag) ? 'primary' : 'default'}
                    variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                    size="small"
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label="🏠 Property" size="small" variant="outlined" />
                <Chip label="💰 Finance" size="small" variant="outlined" />
                <Chip label="📍 Location" size="small" variant="outlined" />
              </Box>
              <Button 
                variant="contained" 
                endIcon={<Send size={16} />}
                disabled={!newPost.trim() || !newPostTitle.trim()}
                onClick={handleCreatePost}
              >
                Post
              </Button>
            </Box>
          </CardContent>
        </Card>

      {/* Community Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
        <Card sx={{ flex: 1, textAlign: 'center' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" color="primary.main">2,847</Typography>
            <Typography variant="body2" color="text.secondary">Active Investors</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, textAlign: 'center' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" color="success.main">$47M</Typography>
            <Typography variant="body2" color="text.secondary">Properties Analyzed</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, textAlign: 'center' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h6" color="warning.main">156</Typography>
            <Typography variant="body2" color="text.secondary">Cities Covered</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Posts Feed */}
      <Stack spacing={3}>
        {posts.map((post) => (
          <Card key={post.id} sx={{ 
            '&:hover': { 
              boxShadow: 4,
              transform: 'translateY(-2px)',
              transition: 'all 0.2s ease-in-out'
            }
          }}>
            <CardContent>
              {/* Post Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {post.avatar}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {post.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {post.timestamp}
                  </Typography>
                </Box>
                {post.location && (
                  <Chip 
                    icon={<MapPin size={14} />}
                    label={post.location}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Post Content */}
              <Typography variant="h6" gutterBottom fontWeight="bold">
                {post.title}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {post.content}
              </Typography>

              {/* Tags */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {post.tags.map((tag, index) => (
                  <Chip 
                    key={index}
                    label={tag}
                    size="small"
                    color={getTagColor(tag) as any}
                    variant="outlined"
                  />
                ))}
                {post.propertyType && (
                  <Chip 
                    icon={<DollarSign size={14} />}
                    label={post.propertyType}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Post Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  size="small"
                  startIcon={<ThumbsUp size={16} />}
                  onClick={() => handleLike(post.id)}
                  color="primary"
                >
                  {post.likes}
                </Button>
                <Button
                  size="small"
                  startIcon={<MessageCircle size={16} />}
                  color="primary"
                  onClick={() => toggleComments(post.id)}
                >
                  {post.comments} Comments
                </Button>
                <Button
                  size="small"
                  startIcon={<Reply size={16} />}
                  color="primary"
                >
                  Reply
                </Button>
                <Box sx={{ flex: 1 }} />
                <IconButton size="small">
                  <TrendingUp size={16} />
                </IconButton>
              </Box>

              {/* Comments Section */}
              <Collapse in={expandedComments.includes(post.id)}>
                <Box sx={{ mt: 2, pl: 2, borderLeft: '2px solid', borderColor: 'grey.200' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Comments ({post.comments})
                  </Typography>
                  
                  {/* Sample Comments */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                        👨‍💼
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        Alex Thompson
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        1 hour ago
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      Great insights! I've been looking at similar properties in that area. What was your experience with the inspection process?
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                        👩‍🔬
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                        Maria Garcia
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        30 minutes ago
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ ml: 4 }}>
                      Thanks for sharing! The numbers look solid. Did you factor in vacancy rates for that market?
                    </Typography>
                  </Box>

                  {/* Add Comment */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Add a comment..."
                      sx={{ flex: 1 }}
                    />
                    <Button size="small" variant="contained">
                      Comment
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Load More */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="outlined" size="large">
          Load More Posts
        </Button>
      </Box>
      </Box>
    </Box>
  );
}
