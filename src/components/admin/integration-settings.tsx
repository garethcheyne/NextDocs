'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Github, Box, Loader2 } from 'lucide-react';

interface IntegrationSettingsProps {
  category: {
    id: string;
    name: string;
    integrationType: string | null;
    githubOwner: string | null;
    githubRepo: string | null;
    devopsProject: string | null;
    devopsAreaPath: string | null;
    syncComments: boolean;
    syncStatus: boolean;
  };
  devopsEnabled?: boolean;
  githubEnabled?: boolean;
}

export default function IntegrationSettings({ category, devopsEnabled = false, githubEnabled = false }: IntegrationSettingsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    category.integrationType || (devopsEnabled ? 'azure-devops' : githubEnabled ? 'github' : 'none')
  );

  // If no integrations are enabled, show warning
  if (!devopsEnabled && !githubEnabled) {
    return (
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3">
              <Box className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">No Integrations Enabled</h3>
              <p className="text-muted-foreground">
                To enable integrations, set one or both of the following environment variables:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><code className="bg-muted px-1.5 py-0.5 rounded">DEVOPS_ENABLED=true</code> for Azure DevOps integration</li>
                <li><code className="bg-muted px-1.5 py-0.5 rounded">GITHUB_ENABLED=true</code> for GitHub integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // GitHub state
  const [githubOwner, setGithubOwner] = useState(category.githubOwner || '');
  const [githubRepo, setGithubRepo] = useState(category.githubRepo || '');

  // Azure DevOps state (org comes from DEVOPS_ORG_URL env var)
  const [devopsProject, setDevopsProject] = useState(category.devopsProject || '');
  const [devopsAreaPath, setDevopsAreaPath] = useState(category.devopsAreaPath || '');

  // Sync settings
  const [syncComments, setSyncComments] = useState(category.syncComments);
  const [syncStatus, setSyncStatus] = useState(category.syncStatus);

  // Update state when category changes
  useEffect(() => {
    setActiveTab(category.integrationType || 'github');
    setGithubOwner(category.githubOwner || '');
    setGithubRepo(category.githubRepo || '');
    setDevopsProject(category.devopsProject || '');
    setDevopsAreaPath(category.devopsAreaPath || '');
    setSyncComments(category.syncComments);
    setSyncStatus(category.syncStatus);
  }, [category]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/features/categories/${category.id}/integrations`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationType: activeTab,
          github: {
            owner: githubOwner,
            repo: githubRepo,
          },
          devops: {
            project: devopsProject,
            areaPath: devopsAreaPath,
          },
          syncSettings: {
            syncComments,
            syncStatus,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Integration settings saved successfully!');
        router.refresh();
      } else {
        alert(`Failed to save: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${devopsEnabled && githubEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {githubEnabled && (
            <TabsTrigger value="github">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </TabsTrigger>
          )}
          {devopsEnabled && (
            <TabsTrigger value="azure-devops">
              <Box className="mr-2 h-4 w-4" />
              Azure DevOps
            </TabsTrigger>
          )}
        </TabsList>

        {githubEnabled && (
          <TabsContent value="github" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GitHub Integration</CardTitle>
                <CardDescription>
                  Connect to a GitHub repository to sync feature requests as issues.
                  Authentication is handled via GitHub OAuth.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-owner">Owner/Organization *</Label>
                    <Input
                      id="github-owner"
                      placeholder="microsoft"
                      value={githubOwner}
                      onChange={(e) => setGithubOwner(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github-repo">Repository *</Label>
                    <Input
                      id="github-repo"
                      placeholder="vscode"
                      value={githubRepo}
                      onChange={(e) => setGithubRepo(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> GitHub OAuth is configured via environment variables.
                  Users will authenticate when creating work items.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {devopsEnabled && (
          <TabsContent value="azure-devops" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Azure DevOps Integration</CardTitle>
                <CardDescription>
                  Connect to Azure DevOps to sync feature requests as work items.
                  Organization URL and authentication are configured via environment variables.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="devops-project">Project Name *</Label>
                  <Input
                    id="devops-project"
                    placeholder="MyProject"
                    value={devopsProject}
                    onChange={(e) => setDevopsProject(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    The name of your Azure DevOps project.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="devops-area">Area Path (Optional)</Label>
                  <Input
                    id="devops-area"
                    placeholder="MyProject\Features"
                    value={devopsAreaPath}
                    onChange={(e) => setDevopsAreaPath(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Default area path for work items. Leave empty to use project root.
                  </p>
                </div>

                <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 p-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Environment Configuration:</strong><br />
                    • Organization URL: <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">DEVOPS_ORG_URL</code><br />
                    • OAuth Client: <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">DEVOPS_CLIENT_ID/SECRET</code><br />
                    • Enabled: <code className="text-xs bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">DEVOPS_ENABLED=true</code>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Card >
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>Configure how features sync with the external system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Comments</Label>
              <p className="text-sm text-muted-foreground">
                Bi-directional comment synchronization
              </p>
            </div>
            <Switch checked={syncComments} onCheckedChange={setSyncComments} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sync Status</Label>
              <p className="text-sm text-muted-foreground">
                Sync status changes between systems
              </p>
            </div>
            <Switch checked={syncStatus} onCheckedChange={setSyncStatus} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
