// src/app/dao/page.tsx
'use client'

import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { contractAddress, contractABI } from '@/utils/contract'
import { useTranslations } from '@/utils/i18n'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Card from '@/components/Card'
import StatsCard from '@/components/StatsCard'
import { Users, FileText, Vote, Clock, Gift } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { formatUnits, parseUnits } from 'viem'
import ProgressBar from '@/components/ProgressBar'

export default function DaoPage() {
  const { address, isConnected } = useAccount()
  const { writeContract } = useWriteContract()
  const t = useTranslations()
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 0,
    targetAddress: '',
    amount: ''
  })
  const [donationAmount, setDonationAmount] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [loading, setLoading] = useState({
    create: false,
    vote: false,
    execute: false,
    donate: false
  })

  const { data: proposals, refetch: refetchProposals } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getActiveProposals',
  }) as { data: any[] | undefined, refetch: () => void }

  const { data: treasuryBalance } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getTreasuryBalance',
  }) as { data: bigint | undefined }

  const { data: votingPower } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'calculateVotingPower',
    args: [address!],
  }) as { data: bigint | undefined }

  const { data: registeredFarmers } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getRegisteredFarmers',
  }) as { data: string[] | undefined }

  const formatApeBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.0000 APE'
    const apeAmount = formatUnits(balance, 18)
    const formatted = Number(apeAmount).toLocaleString(undefined, {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    })
    return `${formatted} APE`
  }

  const createProposal = async () => {
    if (!newProposal.title || !newProposal.description) return

    setLoading({ ...loading, create: true })
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'createProposal',
        args: [
          newProposal.title,
          newProposal.type,
          newProposal.description,
          newProposal.targetAddress,
          newProposal.type === 1 ? parseUnits(newProposal.amount || '0', 18) : BigInt(0)
        ],
        value: parseUnits('0.01', 18),
      })
      toast.success('Proposal created successfully!')
      setShowCreateModal(false)
      setNewProposal({
        title: '',
        description: '',
        type: 0,
        targetAddress: '',
        amount: ''
      })
      refetchProposals()
    } catch (error: any) {
      toast.error(`Failed to create proposal: ${error.shortMessage || error.message}`)
    } finally {
      setLoading({ ...loading, create: false })
    }
  }

  const donateToTreasury = async () => {
    if (!donationAmount) return

    setLoading({ ...loading, donate: true })
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'donateToTreasury',
        value: parseUnits(donationAmount, 18),
      })
      toast.success('Donation successful! Thank you for your contribution.')
      setShowDonateModal(false)
      setDonationAmount('')
    } catch (error: any) {
      toast.error(`Donation failed: ${error.shortMessage || error.message}`)
    } finally {
      setLoading({ ...loading, donate: false })
    }
  }

  const voteOnProposal = async (proposalId: number, vote: boolean) => {
    setLoading({ ...loading, vote: true })
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'voteOnProposal',
        args: [BigInt(proposalId), vote],
      })
      toast.success(`Voted ${vote ? 'Yes' : 'No'} on proposal!`)
      refetchProposals()
    } catch (error: any) {
      toast.error(`Failed to vote: ${error.shortMessage || error.message}`)
    } finally {
      setLoading({ ...loading, vote: false })
    }
  }

  const executeProposal = async (proposalId: number) => {
    setLoading({ ...loading, execute: true })
    try {
      await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'executeProposal',
        args: [BigInt(proposalId)],
      })
      toast.success('Proposal executed successfully!')
      refetchProposals()
    } catch (error: any) {
      toast.error(`Failed to execute proposal: ${error.shortMessage || error.message}`)
    } finally {
      setLoading({ ...loading, execute: false })
    }
  }

  const getProposalType = (type: bigint) => {
    switch (Number(type)) {
      case 0: return t('adminChange')
      case 1: return t('fundAllocation')
      case 2: return t('generalProposal')
      default: return t('unknown')
    }
  }

  const getStatus = (status: bigint) => {
    switch (Number(status)) {
      case 0: return t('pending')
      case 1: return t('active')
      case 2: return t('passed')
      case 3: return t('failed')
      case 4: return t('executed')
      default: return t('unknown')
    }
  }

  const getDisabledReason = (proposal: any) => {
    if (proposal.executed) return t('alreadyExecuted')
    if (proposal.status !== BigInt(2)) return t('proposalNotPassed')
    return t('cannotExecute')
  }

  const calculateVotePercentages = (proposal: any) => {
    const totalMembers = registeredFarmers?.length || 1
    const requiredVotes = (totalMembers * 2) / 3
    
    const yesPercentage = (Number(proposal.yesVotes) / requiredVotes) * 100
    const noPercentage = (Number(proposal.noVotes) / requiredVotes) * 100
    
    return { yesPercentage, noPercentage }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">{t('connectWallet')}</p>
      </div>
    )
  }

  return (
    <main className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">{t('daoGovernance')}</h1>
        <p className="text-secondary-600 mb-8">{t('participateInDAO')}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title={t('treasuryBalance')}
            value={formatApeBalance(treasuryBalance)}
            icon={<FileText className="w-5 h-5" />}
          />
          <StatsCard
            title={t('totalMembers')}
            value={registeredFarmers?.length || 0}
            icon={<Users className="w-5 h-5" />}
          />
          <StatsCard
            title={t('yourVotingPower')}
            value={votingPower?.toString() || '0'}
            icon={<Vote className="w-5 h-5" />}
          />
          <StatsCard
            title={t('activeProposals')}
            value={proposals?.length || 0}
            icon={<Clock className="w-5 h-5" />}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">{t('activeProposals')}</h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowDonateModal(true)}
              className="btn btn-outline flex items-center flex-1 sm:flex-none"
            >
              <Gift className="w-4 h-4 mr-2" />
              {t('donate')}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary flex-1 sm:flex-none"
            >
              {t('createProposal')}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {proposals?.length ? (
            proposals.map((proposal) => {
              const { yesPercentage, noPercentage } = calculateVotePercentages(proposal)
              const totalVotes = Number(proposal.yesVotes) + Number(proposal.noVotes)
              const requiredVotes = registeredFarmers ? (registeredFarmers.length * 2) / 3 : 0
              
              return (
                <Card key={proposal.id.toString()}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{proposal.title}</h3>
                        <p className="text-secondary-600 mt-1">{proposal.description}</p>
                      </div>
                      <div className="text-sm md:text-right w-full md:w-auto">
                        <p className="font-medium">{getProposalType(proposal.proposalType)}</p>
                        <p className={`${proposal.status === BigInt(1) ? 'text-primary-600' :
                            proposal.status === BigInt(2) ? 'text-green-600' :
                              proposal.status === BigInt(3) ? 'text-red-600' : 'text-secondary-600'
                          }`}>
                          {getStatus(proposal.status)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Yes: {proposal.yesVotes.toString()} votes</span>
                        <span>No: {proposal.noVotes.toString()} votes</span>
                      </div>
                      
                      {/* Yes Progress Bar */}
                      <div className="mb-5">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Yes votes</span>
                          <span className="text-secondary-500">{yesPercentage.toFixed(1)}% of required</span>
                        </div>
                        <ProgressBar 
                          progress={yesPercentage} 
                          color="bg-green-500" 
                          // className="h-"
                        />
                      </div>
                      
                      {/* No Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span>No votes</span>
                          <span className="text-secondary-500">{noPercentage.toFixed(1)}% of required</span>
                        </div>
                        <ProgressBar 
                          progress={noPercentage} 
                          color="bg-red-500" 
                          // className="h-4"
                        />
                      </div>
                      
                      <div className="text-xs text-secondary-500 mt-2">
                        {totalVotes >= requiredVotes ? 
                          `Proposal has enough votes (${totalVotes} >= ${requiredVotes})` : 
                          `Needs ${Math.ceil(requiredVotes - totalVotes)} more weighted votes to pass`}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => voteOnProposal(Number(proposal.id), true)}
                        disabled={loading.vote}
                        className="btn btn-outline bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 flex-1 border-green-200"
                      >
                        {loading.vote ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('processing')}
                          </span>
                        ) : t('voteYes')}
                      </button>
                      <button
                        onClick={() => voteOnProposal(Number(proposal.id), false)}
                        disabled={loading.vote}
                        className="btn btn-outline bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 flex-1 border-red-200"
                      >
                        {loading.vote ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('processing')}
                          </span>
                        ) : t('voteNo')}
                      </button>
                      {proposal.proposalType !== BigInt(2) && (
                        <button
                          onClick={() => executeProposal(Number(proposal.id))}
                          disabled={proposal.status !== BigInt(2) || proposal.executed || loading.execute}
                          className={`btn flex-1 ${proposal.status === BigInt(2) && !proposal.executed
                              ? 'btn-primary'
                              : 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                            }`}
                          title={proposal.status !== BigInt(2) || proposal.executed ? getDisabledReason(proposal) : ''}
                        >
                          {loading.execute ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t('processing')}
                            </span>
                          ) : t('execute')}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-secondary-400" />
              <h3 className="text-xl font-semibold mt-4">{t('noActiveProposals')}</h3>
              <p className="text-secondary-600 mt-2">
                {t('noActiveProposalsDesc')}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{t('createProposal')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('title')}</label>
                <input
                  type="text"
                  value={newProposal.title}
                  onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                  className="input-field w-full"
                  placeholder={t('proposalTitlePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('description')}</label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  className="input-field w-full"
                  rows={3}
                  placeholder={t('proposalDescPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('type')}</label>
                <select
                  value={newProposal.type}
                  onChange={(e) => setNewProposal({ ...newProposal, type: Number(e.target.value) })}
                  className="input-field w-full"
                >
                  <option value={0}>{t('adminChange')}</option>
                  <option value={1}>{t('fundAllocation')}</option>
                  <option value={2}>{t('generalProposal')}</option>
                </select>
              </div>

              {newProposal.type === 1 && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('targetAddress')}</label>
                    <input
                      type="text"
                      value={newProposal.targetAddress}
                      onChange={(e) => setNewProposal({ ...newProposal, targetAddress: e.target.value })}
                      className="input-field w-full"
                      placeholder="0x..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">{t('amountAPE')}</label>
                    <input
                      type="number"
                      value={newProposal.amount}
                      onChange={(e) => setNewProposal({ ...newProposal, amount: e.target.value })}
                      className="input-field w-full"
                      placeholder="0.0"
                      step="0.0001"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newProposal.amount && `${newProposal.amount} APE = ${parseUnits(newProposal.amount || '0', 18).toString()} wei`}
                    </p>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={createProposal}
                  disabled={!newProposal.title || !newProposal.description || loading.create}
                  className="btn btn-primary"
                >
                  {loading.create ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('creating')}
                    </span>
                  ) : (
                    `${t('create')} (0.01 APE)`
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">{t('donateToTreasury')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('amountAPE')}</label>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="input-field w-full"
                  placeholder="0.0"
                  step="0.0001"
                  min="0.0001"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {donationAmount && `${donationAmount} APE = ${parseUnits(donationAmount || '0', 18).toString()} wei`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="btn btn-outline"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={donateToTreasury}
                  disabled={!donationAmount || loading.donate}
                  className="btn btn-primary"
                >
                  {loading.donate ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('processing')}
                    </span>
                  ) : t('donate')}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  )
}