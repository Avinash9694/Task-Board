import React from 'react';
import styled from 'styled-components';
import { FiUsers, FiCircle } from 'react-icons/fi';
import { User } from '../types';

const PresenceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const UserCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-weight: 500;
`;

const OnlineIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4ade80;
  font-size: 0.9rem;
`;

const UserList = styled.div`
  position: relative;
`;

const UserTooltip = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  min-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1000;

  ${UserList}:hover & {
    opacity: 1;
    visibility: visible;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 0.9rem;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }
`;

const UserAvatar = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const UserName = styled.span`
  flex: 1;
`;

const ConnectionTime = styled.span`
  font-size: 0.8rem;
  color: #ccc;
`;

interface UserPresenceProps {
  users: User[];
}

const UserPresence: React.FC<UserPresenceProps> = ({ users }) => {
  const formatConnectionTime = (connectedAt: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(connectedAt).getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <PresenceContainer>
      <UserCount>
        <FiUsers size={18} />
        <span>{users.length}</span>
      </UserCount>
      
      <OnlineIndicator>
        <FiCircle size={12} fill="#4ade80" />
        <span>Online</span>
      </OnlineIndicator>

      <UserList>
        <UserTooltip>
          <div style={{ 
            fontSize: '0.8rem', 
            color: '#ccc', 
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Connected Users
          </div>
          {users.map((user) => (
            <UserItem key={user.id}>
              <UserAvatar color={user.color}>
                {getInitials(user.name)}
              </UserAvatar>
              <UserName>{user.name}</UserName>
              <ConnectionTime>
                {formatConnectionTime(user.connectedAt)}
              </ConnectionTime>
            </UserItem>
          ))}
        </UserTooltip>
      </UserList>
    </PresenceContainer>
  );
};

export default UserPresence;
