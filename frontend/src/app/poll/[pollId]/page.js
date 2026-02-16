'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePoll } from '@/hooks/usePoll';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';

export default function PollPage({ params }) {
  const { pollId } = params;
  const searchParams = useSearchParams();
  const created = searchParams.get('created') === 'true';
  
  const { poll, loading, error, castVote, socketStatus } = usePoll(pollId);
  const [selectedOption, setSelectedOption] = useState(null);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState(null);
  const [voteError, setVoteError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Check if we already voted (could use localStorage in real app, but 400 from backend handles it too)
  
  const handleVote = async () => {
    if (!selectedOption) {
      setVoteError('Please select an option first');
      return;
    }

    setVoting(true);
    setVoteError(null);
    
    // Disable button immediately to prevent double click
    const result = await castVote(selectedOption);
    
    if (result.success) {
      setHasVoted(true);
      setVotedOptionId(selectedOption);
      // Auto scroll to results
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      if (result.status === 400) {
        setVoteError('You have already voted on this poll.');
        setHasVoted(true);
      } else {
        setVoteError(result.error);
      }
    }
    setVoting(false);
  };

  const copyLink = () => {
    const url = window.location.href.split('?')[0];
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ border: '4px solid var(--secondary)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading poll...</p>
          <style jsx>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <Card className="max-w-md w-full text-center">
          <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</h2>
          <Button variant="primary" onClick={() => window.location.href = '/'}>Create a New Poll</Button>
        </Card>
      </div>
    );
  }

  if (!poll) return null;

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="container py-12">
      {created && (
        <Card className="mb-8" style={{ borderLeft: '4px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 style={{ color: 'var(--success)', fontWeight: '700' }}>Poll Created Successfully!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Share the link below with your participants.</p>
            </div>
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copySuccess ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </Card>
      )}

      <Card padding="lg" className="max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <span style={{ fontSize: '0.75rem', color: socketStatus === 'connected' ? 'var(--success)' : 'var(--warning)', fontWeight: '700', textTransform: 'uppercase' }}>
              • {socketStatus === 'connected' ? 'Live' : 'Connecting...'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {pollId}</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{poll.question}</h1>
        </header>

        {/* Voting Section */}
        {!hasVoted && (
          <div className="flex flex-col gap-3 mb-8">
            {poll.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  textAlign: 'left',
                  background: selectedOption === option.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--secondary)',
                  border: `1px solid ${selectedOption === option.id ? 'var(--primary)' : 'var(--card-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--foreground)',
                  fontWeight: '500',
                  transition: 'var(--transition)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    border: '2px solid var(--primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    {selectedOption === option.id && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div>}
                  </div>
                  {option.text}
                </div>
              </button>
            ))}
            
            {voteError && <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{voteError}</p>}
            
            <Button 
              variant="primary" 
              className="mt-4" 
              disabled={voting || !selectedOption}
              onClick={handleVote}
            >
              {voting ? 'Casting Vote...' : 'Submit Vote'}
            </Button>
          </div>
        )}

        {/* Results Section */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '2rem' }}>
          <div className="flex justify-between items-end mb-6">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Results</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Votes: {totalVotes}</span>
          </div>

          <div className="flex flex-col gap-2">
            {poll.options.map((option) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              const isUserVote = option.id === votedOptionId;
              
              return (
                <div key={option.id} style={{ position: 'relative' }}>
                  <ProgressBar 
                    percentage={percentage} 
                    label={option.text} 
                    sublabel={`${option.votes} ${option.votes === 1 ? 'vote' : 'votes'}`}
                    color={isUserVote ? 'var(--success)' : 'var(--primary)'}
                  />
                  {isUserVote && (
                    <span style={{ 
                      position: 'absolute', 
                      top: '0', 
                      right: '0', 
                      fontSize: '0.625rem', 
                      background: 'var(--success)', 
                      padding: '2px 6px', 
                      borderRadius: '10px',
                      color: 'white',
                      fontWeight: '700'
                    }}>YOU VOTED</span>
                  )}
                </div>
              );
            })}
          </div>
          
          {hasVoted && (
            <div className="mt-8 text-center">
              <p style={{ color: 'var(--success)', fontWeight: '600' }}>Thanks for voting!</p>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/'} className="mt-2">
                Create your own poll
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      <style jsx global>{`
        .spinner { border: 4px solid var(--secondary); border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
