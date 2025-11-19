'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LayoutDashboard,
  Users,
  Shield,
  Key,
  Building,
  Settings,
  ShoppingCart,
  List,
  Package,
  Plus,
  Clipboard,
  Check,
  Warehouse,
  Box,
  Truck,
  Ship,
  Search,
  FileText,
  DollarSign,
  CreditCard,
  Receipt,
  AlertTriangle,
  User,
  LogOut,
  ChevronDown,
  Menu
} from 'lucide-react'

interface MenuItem {
  title: string
  href?: string
  icon?: string
  children?: MenuItem[]
  permissions?: string[]
}

const iconMap = {
  dashboard: LayoutDashboard,
  users: Users,
  shield: Shield,
  key: Key,
  building: Building,
  cog: Settings,
  'shopping-cart': ShoppingCart,
  list: List,
  package: Package,
  plus: Plus,
  clipboard: Clipboard,
  check: Check,
  warehouse: Warehouse,
  boxes: Box,
  truck: Truck,
  shipping: Ship,
  search: Search,
  'file-text': FileText,
  'dollar-sign': DollarSign,
  'credit-card': CreditCard,
  receipt: Receipt,
  'alert-triangle': AlertTriangle,
  user: User,
  settings: Settings,
}

export function DynamicSidebar() {
  const { user, logout } = useAuth()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (user) {
      fetchNavigationMenu()
    }
  }, [user])

  const fetchNavigationMenu = async () => {
    try {
      const token = localStorage.getItem('accessToken')
            
      const response = await fetch('/api/v1/auth/navigation', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const menu = await response.json()
        setMenuItems(menu)
      }
    } catch (error) {
      console.error('Error fetching navigation menu:', error)
    }
  }

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null
    const IconComponent = iconMap[iconName as keyof typeof iconMap]
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const isActive = item.href === pathname
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <div className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
            level > 0 && "ml-4"
          )}>
            {renderIcon(item.icon)}
            {!isCollapsed && (
              <>
                <span className="font-medium">{item.title}</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </>
            )}
          </div>
          {!isCollapsed && item.children && (
            <div className="space-y-1">
              {item.children.map(child => renderMenuItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={item.title}
        href={item.href || '#'}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900",
          level > 0 && "ml-4",
          isActive 
            ? "bg-gray-100 text-gray-900" 
            : "text-gray-500"
        )}
      >
        {renderIcon(item.icon)}
        {!isCollapsed && <span>{item.title}</span>}
      </Link>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={cn(
      "flex h-full max-h-screen flex-col gap-2 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          <Menu className="h-4 w-4" />
        </Button>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold ml-2">
            <Package className="h-6 w-6" />
            <span>i-ContExchange</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>

      {/* User Menu */}
      <div className="mt-auto p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "flex items-center gap-2 w-full justify-start",
                isCollapsed && "justify-center p-2"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user.fullName || user.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.roles.join(', ')}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.fullName || user.email}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout}
              className="cursor-pointer text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default DynamicSidebar