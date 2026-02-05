import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Landmark,
  Search,
  ExternalLink,
  CheckCircle,
  IndianRupee,
  Shield,
  Building,
  GraduationCap,
  Wallet,
  HelpCircle
} from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';

interface Scheme {
  id: string;
  name_en: string;
  name_hi: string;
  name_mr: string;
  description_en: string;
  description_hi: string;
  description_mr: string;
  eligibility_en: string | null;
  eligibility_hi: string | null;
  eligibility_mr: string | null;
  benefits_en: string | null;
  benefits_hi: string | null;
  benefits_mr: string | null;
  how_to_apply_en: string | null;
  how_to_apply_hi: string | null;
  how_to_apply_mr: string | null;
  official_link: string | null;
  scheme_code: string;
  category: string;
}

type Category = 'all' | 'subsidy' | 'insurance' | 'credit' | 'infrastructure' | 'training' | 'other';

const categoryConfig: Record<Category, { icon: typeof Landmark; label: { en: string; hi: string; mr: string }; color: string }> = {
  all: { icon: Landmark, label: { en: 'All Schemes', hi: 'सभी योजनाएं', mr: 'सर्व योजना' }, color: 'bg-primary' },
  subsidy: { icon: IndianRupee, label: { en: 'Subsidy', hi: 'सब्सिडी', mr: 'अनुदान' }, color: 'bg-green-500' },
  insurance: { icon: Shield, label: { en: 'Insurance', hi: 'बीमा', mr: 'विमा' }, color: 'bg-blue-500' },
  credit: { icon: Wallet, label: { en: 'Credit', hi: 'ऋण', mr: 'कर्ज' }, color: 'bg-amber-500' },
  infrastructure: { icon: Building, label: { en: 'Infrastructure', hi: 'इंफ्रास्ट्रक्चर', mr: 'पायाभूत सुविधा' }, color: 'bg-purple-500' },
  training: { icon: GraduationCap, label: { en: 'Training', hi: 'प्रशिक्षण', mr: 'प्रशिक्षण' }, color: 'bg-cyan-500' },
  other: { icon: HelpCircle, label: { en: 'Other', hi: 'अन्य', mr: 'इतर' }, color: 'bg-gray-500' },
};

const GovtSchemes = () => {
  const { language } = useLanguage();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('government_schemes')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (scheme: Scheme, field: 'name' | 'description' | 'eligibility' | 'benefits' | 'how_to_apply'): string => {
    const key = `${field}_${language}` as keyof Scheme;
    const fallback = `${field}_en` as keyof Scheme;
    return (scheme[key] as string) || (scheme[fallback] as string) || '';
  };

  const filteredSchemes = schemes.filter((scheme) => {
    if (selectedCategory !== 'all' && scheme.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const name = getText(scheme, 'name').toLowerCase();
      const description = getText(scheme, 'description').toLowerCase();
      const code = scheme.scheme_code.toLowerCase();
      return name.includes(query) || description.includes(query) || code.includes(query);
    }
    return true;
  });

  const labels = {
    title: { en: 'Government Schemes', hi: 'सरकारी योजनाएं', mr: 'सरकारी योजना' },
    search: { en: 'Search schemes...', hi: 'योजनाएं खोजें...', mr: 'योजना शोधा...' },
    eligibility: { en: 'Who Can Apply', hi: 'कौन आवेदन कर सकता है', mr: 'कोण अर्ज करू शकतो' },
    benefits: { en: 'Benefits', hi: 'लाभ', mr: 'फायदे' },
    howToApply: { en: 'How to Apply', hi: 'आवेदन कैसे करें', mr: 'अर्ज कसा करावा' },
    visitWebsite: { en: 'Visit Official Website', hi: 'आधिकारिक वेबसाइट देखें', mr: 'अधिकृत वेबसाइट भेट द्या' },
    noSchemes: { en: 'No schemes found', hi: 'कोई योजना नहीं मिली', mr: 'कोणतीही योजना सापडली नाही' },
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4 space-y-3">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Landmark className="w-6 h-6 text-primary" />
          {labels.title[language as keyof typeof labels.title] || labels.title.en}
        </h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={labels.search[language as keyof typeof labels.search] || labels.search.en}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {(Object.keys(categoryConfig) as Category[]).map((cat) => {
            const config = categoryConfig[cat];
            const isSelected = selectedCategory === cat;
            return (
              <Button
                key={cat}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="flex-shrink-0"
              >
                <config.icon className="w-4 h-4 mr-1" />
                {config.label[language as keyof typeof config.label] || config.label.en}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Schemes List */}
      <div className="flex-1 p-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : filteredSchemes.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title={labels.noSchemes[language as keyof typeof labels.noSchemes] || labels.noSchemes.en}
            description=""
          />
        ) : (
          <div className="space-y-4">
            {filteredSchemes.map((scheme) => {
              const config = categoryConfig[scheme.category as Category] || categoryConfig.other;
              const CategoryIcon = config.icon;

              return (
                <Card key={scheme.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <CategoryIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground">{getText(scheme, 'name')}</h3>
                        <Badge variant="outline" className="flex-shrink-0">
                          {scheme.scheme_code}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getText(scheme, 'description')}
                      </p>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="mt-4">
                    {getText(scheme, 'eligibility') && (
                      <AccordionItem value="eligibility">
                        <AccordionTrigger className="text-sm py-2">
                          <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            {labels.eligibility[language as keyof typeof labels.eligibility] || labels.eligibility.en}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {getText(scheme, 'eligibility')}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {getText(scheme, 'benefits') && (
                      <AccordionItem value="benefits">
                        <AccordionTrigger className="text-sm py-2">
                          <span className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-green-500" />
                            {labels.benefits[language as keyof typeof labels.benefits] || labels.benefits.en}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {getText(scheme, 'benefits')}
                        </AccordionContent>
                      </AccordionItem>
                    )}

                    {getText(scheme, 'how_to_apply') && (
                      <AccordionItem value="apply">
                        <AccordionTrigger className="text-sm py-2">
                          <span className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                            {labels.howToApply[language as keyof typeof labels.howToApply] || labels.howToApply.en}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                          {getText(scheme, 'how_to_apply')}
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>

                  {scheme.official_link && (
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <a href={scheme.official_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {labels.visitWebsite[language as keyof typeof labels.visitWebsite] || labels.visitWebsite.en}
                      </a>
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GovtSchemes;
