'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    
    // Clear error for this option if it exists
    if (errors[`option_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`option_${index}`];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!question.trim()) newErrors.question = 'Question is required';
    
    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      newErrors.general = 'At least 2 valid options are required';
    }

    options.forEach((opt, index) => {
      if (!opt.trim()) {
        newErrors[`option_${index}`] = 'Option cannot be empty';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/polls', {
        question,
        options: options.map(opt => ({ text: opt.trim() })),
      });
      
      // Redirect to poll page
      router.push(`/poll/${res.data.id}?created=true`);
    } catch (err) {
      setErrors({ server: err.detail || 'Failed to create poll' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '0.5rem', 
          color: 'var(--foreground)',
          letterSpacing: '-0.02em'
        }}>
          Create a Poll
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
          Simple, real-time, and anonymous.
        </p>
      </header>

      <Card padding="lg" className="w-full max-w-2xl mx-auto" style={{ borderTop: '4px solid var(--primary)' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input 
            label="Question" 
            placeholder="What's on your mind?" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            error={errors.question}
          />

          <div className="flex flex-col gap-4">
            <label className="label" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input 
                  placeholder={`Option ${index + 1}`} 
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  error={errors[`option_${index}`]}
                  className="w-full"
                />
                {options.length > 2 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => removeOption(index)}
                    style={{ marginTop: '0.5rem', color: 'var(--error)' }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addOption}
              className="mt-2"
              style={{ alignSelf: 'flex-start' }}
            >
              + Add Option
            </Button>
          </div>

          {errors.general && <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>{errors.general}</p>}
          {errors.server && <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center', fontWeight: '500' }}>{errors.server}</p>}

          <Button 
            type="submit" 
            variant="primary" 
            size="lg"
            disabled={loading}
            className="mt-4"
            style={{ width: '100%' }}
          >
            {loading ? 'Creating...' : 'Launch Poll'}
          </Button>
        </form>
      </Card>

      <footer className="mt-8 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>Your participants can vote instantly without any signup.</p>
      </footer>
    </div>
  );
}
