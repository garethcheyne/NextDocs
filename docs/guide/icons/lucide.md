# Lucide Icons

Browse and search the Lucide icon library - 1,000+ clean, consistent icons.

## Quick Reference :bookmark:

### Common Icons by Category

#### Navigation & UI
```
Home, Menu, Settings, Search, X, Check, Plus, Minus, ChevronDown, ChevronUp, 
ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, 
MoreVertical, MoreHorizontal, ExternalLink, Maximize, Minimize
```

#### Files & Folders
```
File, FileText, Folder, FolderOpen, Download, Upload, Save, Copy, 
Clipboard, FileCode, FileJson, FileSpreadsheet, Archive
```

#### Communication
```
Mail, Send, MessageSquare, MessageCircle, Phone, PhoneCall, Video, 
Mic, MicOff, Bell, BellOff
```

#### Media
```
Play, Pause, Square (Stop), SkipForward, SkipBack, Volume, Volume1, 
Volume2, VolumeX, Music, Image, Film, Camera
```

#### Development
```
Code, Terminal, GitBranch, GitCommit, GitMerge, GitPullRequest, 
Package, Bug, Wrench, Tool, Hammer, Database, Server, Cloud
```

#### Status & Alerts
```
CheckCircle, XCircle, AlertTriangle, AlertCircle, Info, HelpCircle, 
AlertOctagon, ShieldAlert, ShieldCheck
```

#### Actions
```
Edit, Trash, Trash2, RotateCw, RotateCcw, RefreshCw, RefreshCcw, 
Zap, Power, Lock, Unlock, Eye, EyeOff, Star, Heart
```

#### Time & Calendar
```
Calendar, Clock, Timer, AlarmClock, Watch, Hourglass, TrendingUp, 
TrendingDown, Activity
```

#### Social & Sharing
```
Share, Share2, Link, Link2, Facebook, Twitter, Github, Linkedin, 
Instagram, Youtube, Globe
```

#### Text & Formatting
```
Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
AlignJustify, List, ListOrdered, Heading1, Heading2, Type, Quote
```

#### Documents & Learning
```
Book, BookOpen, Library, GraduationCap, Award, Bookmark, Newspaper, 
FileText, Scroll, Clipboard
```

#### Business & Finance
```
Briefcase, DollarSign, CreditCard, ShoppingCart, ShoppingBag, Tag, 
TrendingUp, BarChart, PieChart, LineChart
```

## Usage Examples :code:

### In _meta.json

```json
{
  "index": {
    "title": "Home",
    "icon": "Home"
  },
  "getting-started": {
    "title": "Getting Started",
    "icon": "Rocket"
  },
  "guides": {
    "title": "User Guides",
    "icon": "BookOpen"
  },
  "api": {
    "title": "API Reference",
    "icon": "Code"
  },
  "examples": {
    "title": "Examples",
    "icon": "Lightbulb"
  }
}
```

### In Markdown Content

```markdown
## Quick Links

:home: [Home](./index.md)
:book: [Documentation](./docs.md)
:code: [API Reference](./api.md)
:help-circle: [FAQ](./faq.md)

## Features

:check-circle: Easy to use
:zap: Lightning fast
:shield: Secure by default
:globe: Works everywhere

## Status Updates

:rocket: Launched new feature
:alert-triangle: Maintenance scheduled
:info: New documentation available
```

## Formatting in Different Contexts :palette:

### Kebab-case (Markdown)
Use in markdown content:
```markdown
:check-circle: Done
:arrow-right: Next
:file-text: Document
```

### PascalCase (JSON)
Use in `_meta.json` files:
```json
{
  "icon": "CheckCircle",
  "icon": "ArrowRight",
  "icon": "FileText"
}
```

Both formats work in both places, but these are the conventions.

## Choosing Icons for Documentation :lightbulb:

### Landing Pages
`Home`, `BookOpen`, `Layout`, `Layers`

### Getting Started / Onboarding
`Rocket`, `Zap`, `Play`, `FastForward`, `Compass`

### Installation / Setup
`Download`, `Package`, `Settings`, `Tool`, `Wrench`

### User Guides / Tutorials
`Book`, `GraduationCap`, `Map`, `Target`, `Lightbulb`

### API / Technical Reference
`Code`, `Terminal`, `Braces`, `FileCode`, `Database`

### Configuration / Settings
`Settings`, `Sliders`, `Toggle`, `Tool`, `Cog`

### Troubleshooting / FAQ
`AlertTriangle`, `HelpCircle`, `LifeBuoy`, `MessageCircle`

### Examples / Demos
`Lightbulb`, `Sparkles`, `Eye`, `TestTube`, `Beaker`

### Advanced Topics
`Cpu`, `Rocket`, `Zap`, `TrendingUp`, `Activity`

### Security / Authentication
`Lock`, `Shield`, `Key`, `ShieldCheck`, `UserCheck`

### Performance / Optimization
`Zap`, `TrendingUp`, `Activity`, `Gauge`, `BarChart`

## Official Resources :external-link:

- **Official Website**: [lucide.dev](https://lucide.dev)
- **Icon Search**: Search and copy icon names directly
- **GitHub**: [lucide-icons/lucide](https://github.com/lucide-icons/lucide)

## Common Questions :help-circle:

**Q: How do I know the exact icon name?**  
A: Visit [lucide.dev](https://lucide.dev) to search and browse all icons with their exact names.

**Q: Are new icons added?**  
A: Yes! Lucide is actively maintained. NextDocs updates periodically to include new icons.

**Q: What if I use a wrong icon name?**  
A: The icon syntax will display as plain text. Check spelling and capitalization.

**Q: Can I customize icon size or color?**  
A: Icon size and color are controlled by NextDocs styling. You can't customize individual icons.

## Popular Icon Combinations :package:

### Documentation Site Navigation
```json
{
  "index": { "icon": "Home" },
  "docs": { "icon": "BookOpen" },
  "api": { "icon": "Code" },
  "guides": { "icon": "Map" },
  "examples": { "icon": "Lightbulb" },
  "faq": { "icon": "HelpCircle" }
}
```

### Software Documentation
```json
{
  "installation": { "icon": "Download" },
  "configuration": { "icon": "Settings" },
  "usage": { "icon": "Play" },
  "advanced": { "icon": "Cpu" },
  "troubleshooting": { "icon": "AlertTriangle" }
}
```

### API Documentation
```json
{
  "overview": { "icon": "Info" },
  "authentication": { "icon": "Lock" },
  "endpoints": { "icon": "Terminal" },
  "examples": { "icon": "Code" },
  "errors": { "icon": "AlertCircle" }
}
```

## Next Steps :compass:

- [View FluentUI Icons](./fluentui.md) for alternative icon styles
- [Back to Icon Overview](./index.md)
- [Learn about Navigation & Metadata](../metadata.md)
