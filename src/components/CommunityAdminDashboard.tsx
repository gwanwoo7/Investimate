import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import {
  Search,
  Delete,
  Edit,
  Visibility,
  Block,
  CheckCircle,
  Message,
  ThumbUp,
  Flag,
  TrendingUp,
  People,
  Forum
} from '@mui/icons-material';
import DatabaseService, { type CommunityPost, type Comment } from '../services/databaseService';

export default function CommunityAdminDashboard() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postDetailsOpen, setPostDetailsOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const db = DatabaseService.getInstance();

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      const communityPosts = await db.getPosts();
      setPosts(communityPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error loading community data:', error);
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeletePost = (post: CommunityPost) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleViewPost = (post: CommunityPost) => {
    setSelectedPost(post);
    setPostDetailsOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPost) return;
    
    try {
      await db.deletePost(selectedPost.id);
      await loadCommunityData();
      setDeleteDialogOpen(false);
      setSelectedPost(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getCommunityStats = () => {
    const totalPosts = posts.length;
    const totalComments = posts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const activeUsers = new Set(posts.map(post => post.author)).size;

    return { totalPosts, totalComments, totalLikes, activeUsers };
  };

  const stats = getCommunityStats();

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        💬 Community Management Dashboard
      </Typography>

      {/* Community Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Forum color="primary" />
              <Box>
                <Typography variant="h4" color="primary">{stats.totalPosts}</Typography>
                <Typography variant="body2" color="text.secondary">Total Posts</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Message color="success" />
              <Box>
                <Typography variant="h4" color="success.main">{stats.totalComments}</Typography>
                <Typography variant="body2" color="text.secondary">Comments</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ThumbUp color="info" />
              <Box>
                <Typography variant="h4" color="info.main">{stats.totalLikes}</Typography>
                <Typography variant="body2" color="text.secondary">Total Likes</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px', minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <People color="warning" />
              <Box>
                <Typography variant="h4" color="warning.main">{stats.activeUsers}</Typography>
                <Typography variant="body2" color="text.secondary">Active Users</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          placeholder="Search posts by title, content, or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filterCategory}
            label="Category"
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="General Discussion">General Discussion</MenuItem>
            <MenuItem value="Market Analysis">Market Analysis</MenuItem>
            <MenuItem value="Deal Sharing">Deal Sharing</MenuItem>
            <MenuItem value="Tips & Advice">Tips & Advice</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading community data...</Typography>
      ) : (
        <>
          {/* Posts Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Post</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Engagement</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          maxWidth: 300
                        }}>
                          {post.content}
                        </Typography>
                        {post.tags && post.tags.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Chip key={index} label={tag} size="small" variant="outlined" />
                            ))}
                            {post.tags.length > 3 && (
                              <Chip label={`+${post.tags.length - 3}`} size="small" variant="outlined" />
                            )}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {post.author.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">
                          {post.author}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={post.category} 
                        color="primary" 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ThumbUp fontSize="small" color="action" />
                          <Typography variant="caption">{post.likes || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Message fontSize="small" color="action" />
                          <Typography variant="caption">{post.comments?.length || 0}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleViewPost(post)}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Post">
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleDeletePost(post)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredPosts.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? 'No posts found matching your search.' : 'No community posts yet.'}
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Post Details Dialog */}
      <Dialog open={postDetailsOpen} onClose={() => setPostDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post Details</DialogTitle>
        <DialogContent dividers>
          {selectedPost && (
            <Box>
              <Typography variant="h6" gutterBottom>{selectedPost.title}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                By {selectedPost.author} • {new Date(selectedPost.timestamp).toLocaleDateString()} • {selectedPost.category}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body1" paragraph>{selectedPost.content}</Typography>
              
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selectedPost.tags.map((tag, index) => (
                      <Chip key={index} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              
              {selectedPost.comments && selectedPost.comments.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Comments ({selectedPost.comments.length}):
                  </Typography>
                  {selectedPost.comments.map((comment, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 1, bgcolor: 'grey.50' }}>
                      <Typography variant="body2" fontWeight="medium">
                        {comment.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {comment.content}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPostDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the post "{selectedPost?.title}"? 
            This action cannot be undone and will also delete all comments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete Post</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
