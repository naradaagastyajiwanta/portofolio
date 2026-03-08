'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Plus, Trash2, Power, Check, X, Key } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiToken {
  id: string
  name: string
  scopes: string[]
  lastUsedAt: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  tokenPreview?: string
}

export default function ApiTokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/api-tokens`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setTokens(data.tokens || [])
      }
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
    } finally {
      setLoading(false)
    }
  }

  const createToken = async () => {
    if (!newTokenName.trim()) return

    try {
      const res = await fetch(`${API_URL}/api/admin/api-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newTokenName,
          scopes: ['blog:write']
        })
      })

      if (res.ok) {
        const data = await res.json()
        setNewToken(data.token)
        setShowCreateModal(false)
        setNewTokenName('')
        fetchTokens()
      }
    } catch (error) {
      console.error('Failed to create token:', error)
    }
  }

  const deleteToken = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API token?')) return

    try {
      const res = await fetch(`${API_URL}/api/admin/api-tokens/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (res.ok) {
        fetchTokens()
      }
    } catch (error) {
      console.error('Failed to delete token:', error)
    }
  }

  const toggleToken = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/api-tokens/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (res.ok) {
        fetchTokens()
      }
    } catch (error) {
      console.error('Failed to toggle token:', error)
    }
  }

  const copyToken = () => {
    if (newToken) {
      navigator.clipboard.writeText(newToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">API Tokens</h1>
            <p className="text-muted-foreground">
              Manage API tokens for webhook integrations
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Token
          </Button>
        </div>

        {/* New Token Display */}
        {newToken && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Your New API Token
              </CardTitle>
              <CardDescription>
                Copy this token now. You won't be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={newToken}
                  readOnly
                  className="font-mono text-sm bg-background"
                />
                <Button onClick={copyToken} variant="outline" className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tokens List */}
        <div className="space-y-4">
          {loading ? (
            <p>Loading...</p>
          ) : tokens.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No API tokens yet</p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Token
                </Button>
              </CardContent>
            </Card>
          ) : (
            tokens.map((token) => (
              <Card key={token.id} className={!token.isActive ? 'opacity-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{token.name}</h3>
                        <Badge variant={token.isActive ? 'default' : 'secondary'}>
                          {token.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mb-3">
                        {token.tokenPreview}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {token.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Created: {new Date(token.createdAt).toLocaleDateString()}</p>
                        {token.lastUsedAt && (
                          <p>Last used: {new Date(token.lastUsedAt).toLocaleDateString()}</p>
                        )}
                        {token.expiresAt && (
                          <p>Expires: {new Date(token.expiresAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleToken(token.id)}
                        className={token.isActive ? 'text-yellow-600' : 'text-green-600'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteToken(token.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Create Token Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle>Create API Token</CardTitle>
                <CardDescription>
                  Give your token a descriptive name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Token Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Blog Automation Script"
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createToken()}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createToken} disabled={!newTokenName.trim()}>
                      Create Token
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Webhook Documentation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Webhook API Documentation</CardTitle>
            <CardDescription>
              Use these endpoints to automate blog post creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Create Blog Post</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-mono bg-background px-2 py-1 rounded">POST</span> <span className="font-mono">{API_URL}/api/webhook/blog</span></p>
                <p className="text-muted-foreground">Headers:</p>
                <pre className="bg-background p-2 rounded overflow-x-auto">
{`Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json`}
                </pre>
                <p className="text-muted-foreground mt-2">Body:</p>
                <pre className="bg-background p-2 rounded overflow-x-auto">
{`{
  "title": "My Blog Post",
  "content": "# Markdown content\\n\\nYour post content here...",
  "excerpt": "Short summary",
  "status": "published",
  "tags": ["Tutorial", "Web Dev"],
  "coverImage": "https://example.com/image.jpg"
}`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Update Blog Post</h4>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p><span className="font-mono bg-background px-2 py-1 rounded">PATCH</span> <span className="font-mono">{API_URL}/api/webhook/blog/:slug</span></p>
                <p className="text-muted-foreground">Same authentication and body format as create</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
