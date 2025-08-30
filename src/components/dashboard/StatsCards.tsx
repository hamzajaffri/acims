import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  Users, 
  FileText, 
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statCards = [
    {
      title: 'Total Cases',
      value: stats.totalCases,
      icon: Folder,
      trend: '+12%',
      trendUp: true,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Cases', 
      value: stats.activeCases,
      icon: Clock,
      trend: '+5%',
      trendUp: true,
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Closed Cases',
      value: stats.closedCases, 
      icon: CheckCircle,
      trend: '+8%',
      trendUp: true,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Total Victims',
      value: stats.totalVictims,
      icon: Users,
      trend: '+2%', 
      trendUp: false,
      gradient: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Evidence Items',
      value: stats.totalEvidence,
      icon: FileText,
      trend: '+15%',
      trendUp: true, 
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      title: 'Open Cases',
      value: stats.openCases,
      icon: AlertCircle,
      trend: '+3%',
      trendUp: true,
      gradient: 'from-red-500 to-pink-600' 
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden border-border bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
          <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-5`} />
          
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${card.gradient} shadow-lg`}>
              <card.icon className="w-4 h-4 text-white" />
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold font-orbitron">
                {card.value.toLocaleString()}
              </div>
              <Badge 
                variant={card.trendUp ? 'default' : 'secondary'} 
                className={`${card.trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} border-0`}
              >
                <TrendingUp className={`w-3 h-3 mr-1 ${!card.trendUp ? 'rotate-180' : ''}`} />
                {card.trend}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              vs last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}