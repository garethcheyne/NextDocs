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
import { Github, Box, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface IntegrationSettingsProps {
  category: {
    id: string;
    name: string;
    integrationType: string | null;
    githubOwner: string | null;
    githubRepo: string | null;
    devopsOrg: string | null;
    devopsProject: string | null;
    devopsAreaPath: string | null;
    autoCreateOnApproval: boolean;
    syncComments: boolean;
    syncStatus: boolean;
  };
}

export default function IntegrationSettings({ category }: IntegrationSettingsProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>(category.integrationType || 'github');

  // GitHub state
  const [githubOwner, setGithubOwner] = useState(category.githubOwner || '');
  const [githubRepo, setGithubRepo] = useState(category.githubRepo || '');
  const [githubPat, setGithubPat] = useState('');

  // Azure DevOps state
  const [devopsOrg, setDevopsOrg] = useState(category.devopsOrg || '');
  const [devopsProject, setDevopsProject] = useState(category.devopsProject || '');
  const [devopsAreaPath, setDevopsAreaPath] = useState(category.devopsAreaPath || '');
  const [devopsPat, setDevopsPat] = useState('');

  // Sync settings
  const [autoCreateOnApproval, setAutoCreateOnApproval] = useState(category.autoCreateOnApproval);
  const [syncComments, setSyncComments] = useState(category.syncComments);
  const [syncStatus, setSyncStatus] = useState(category.syncStatus);

  // Update state when category changes
  useEffect(() => {
    setActiveTab(category.integrationType || 'github');
    setGithubOwner(category.githubOwner || '');
    setGithubRepo(category.githubRepo || '');
    setDevopsOrg(category.devopsOrg || '');
    setDevopsProject(category.devopsProject || '');
    setDevopsAreaPath(category.devopsAreaPath || '');
    setAutoCreateOnApproval(category.autoCreateOnApproval);
    setSyncComments(category.syncComments);
    setSyncStatus(category.syncStatus);
    // PATs are never loaded from database for security
    setGithubPat('');
    setDevopsPat('');
  }, [category]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/admin/features/categories/${category.id}/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeTab,
          github: { owner: githubOwner, repo: githubRepo, pat: githubPat },
          devops: { org: devopsOrg, project: devopsProject, pat: devopsPat },
        }),
      });

      const data = await response.json();
      setTestResult({ success: response.ok, message: data.message });
    } catch (error) {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setIsTesting(false);
    }
  };

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
            pat: githubPat || undefined,
          },
          devops: {
            org: devopsOrg,
            project: devopsProject,
            areaPath: devopsAreaPath,
            pat: devopsPat || undefined,
          },
          syncSettings: {
            autoCreateOnApproval,
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="github">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </TabsTrigger>
          <TabsTrigger value="azure-devops">
            <Box className="mr-2 h-4 w-4" />
            Azure DevOps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="github" className="space-y-4">
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Connect to a GitHub repository to sync feature requests as issues
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="github-owner">Owner/Organization</Label>
                  <Input
                    id="github-owner"
                    placeholder="microsoft"
                    value={githubOwner}
                    onChange={(e) => setGithubOwner(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github-repo">Repository</Label>
                  <Input
                    id="github-repo"
                    placeholder="vscode"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github-pat">Personal Access Token</Label>
                <Input
                  id="github-pat"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={githubPat}
                  onChange={(e) => setGithubPat(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Required scopes: <code className="text-xs">repo</code>, <code className="text-xs">write:discussion</code>
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || !githubOwner || !githubRepo}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {testResult && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
                    }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="azure-devops" className="space-y-4">
          <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Azure DevOps Integration</CardTitle>
              <CardDescription>
                Connect to Azure DevOps to sync feature requests as work items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="devops-org">Organization</Label>
                  <Input
                    id="devops-org"
                    placeholder="mycompany"
                    value={devopsOrg}
                    onChange={(e) => setDevopsOrg(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="devops-project">Project</Label>
                  <Input
                    id="devops-project"
                    placeholder="MyProject"
                    value={devopsProject}
                    onChange={(e) => setDevopsProject(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="devops-area">Area Path (Optional)</Label>
                <Input
                  id="devops-area"
                  placeholder="MyProject\\Features"
                  value={devopsAreaPath}
                  onChange={(e) => setDevopsAreaPath(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="devops-pat">Personal Access Token</Label>
                <Input
                  id="devops-pat"
                  type="password"
                  placeholder="Enter Azure DevOps PAT"
                  value={devopsPat}
                  onChange={(e) => setDevopsPat(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Required scopes: <code className="text-xs">Work Items (Read, Write)</code>
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || !devopsOrg || !devopsProject}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {testResult && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
                    }`}
                >
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-gray-900/40 border-gray-800/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Sync Settings</CardTitle>
          <CardDescription>Configure how features sync with the external system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-create on Approval</Label>
              <p className="text-sm text-muted-foreground">
                Automatically create work item when feature is approved
              </p>
            </div>
            <Switch
              checked={autoCreateOnApproval}
              onCheckedChange={setAutoCreateOnApproval}
            />
          </div>

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
