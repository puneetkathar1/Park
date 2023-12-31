import React, { useState, useEffect } from 'react'
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useColorModeValue } from '@chakra-ui/react'
import {
  Bars3Icon,
  BellAlertIcon,
  ChatBubbleLeftEllipsisIcon,
  QuestionMarkCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { LinkIcon } from '@heroicons/react/24/outline'
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
} from '@chakra-ui/react'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import { Spinner } from '@chakra-ui/react'
import { Search2Icon } from '@chakra-ui/icons'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/20/solid'

function Header2({
  user,
  setUser,
  isOpen,
  onOpen,
  onClose,
  current,
  setShowDrawer,
  showDrawer,
  subscriptionDetails,
  setSubscriptionDetails,
}) {
  const [isLoading, setLoading] = useState(true)
  const [notifications, setNotification] = useState()
  const [isOpen2, setIsOpen2] = useState(false)
  const toast = useToast()
  const handleMenuClick = () => {
    setIsOpen2(!isOpen2)
  }

  const handleMarkAsRead = async (e, notificationId) => {
    e.preventDefault()
    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/markAsRead`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
        }),
      },
    )

    const resData = await res.json()

    if (resData.error) {
      console.log('Error updating notification!')
      toast({
        title: 'Something went wrong!',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    } else if (resData.message) {
      const temp = notifications.map((el) => {
        if (el._id == notificationId) {
          el.isRead = true
          return el
        } else {
          return el
        }
      })
      setNotification(temp)
      toast({
        title: 'Marked as read!',
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
    }
  }
  const authToken = Cookies.get('token')
  const router = useNavigate()

  const getNotification = async (count) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/getNotifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ count }),
      },
    )
    const data = await response.json()
    console.log(data)
    setNotification(data.notifications)
  }

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      // Check if subscription details exist in localStorage
      const cachedSubscriptionDetails = localStorage.getItem(
        'subscriptionDetails',
      )
      if (cachedSubscriptionDetails) {
        const data = JSON.parse(cachedSubscriptionDetails)
        setSubscriptionDetails(data)
        setUser(data.user)
        setLoading(false)
      } else {
        // Fetch subscription details from the API
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/getSubscription`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        )
        const data = await response.json()
        console.log(data)
        if (data.error === 'User not found!') {
          await Cookies.remove('token')
          await localStorage.removeItem('subscriptionDetails')
          await Cookies.remove('email')
          await Cookies.remove('selectedNamespace')
          await Cookies.remove('selectedChatId')
          await Cookies.remove('selectedFolder')
          router('/signin')
        }
        setUser(data.user)
        setSubscriptionDetails(data)
        setLoading(false)

        // Cache the subscription details in localStorage
        localStorage.setItem('subscriptionDetails', JSON.stringify(data))
      }
    }

    fetchSubscriptionDetails()
    getNotification(5)
  }, [authToken])
  if (!authToken) {
    router('/signin')
  }

  const notificationColor = useColorModeValue('bg-green-200', 'bg-green-400')


  const bg = useColorModeValue('bg-white', 'bg-slate-800')

  const handleLinkClick = (index) => {
    onClose()
  }

  return (
    <>
      <Modal isCentered isOpen={isLoading}>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
          className="items-center flex justify-center"
        >
          <Spinner size="xl" />
        </ModalOverlay>
      </Modal>
      {/* Header */}
      <Box
        className={`z-50 w-full ${bg} h-18 shrink-0 flex items-center sticky top-0 border-[#CEC7C7] border-b-2`}
      >
        {/* Menu */}
        <div className="flex-1 flex relative justify-center items-center ">
          <div className="">
            <div className="m-2 text-lg md:text-3xl font-semibold text-blue-300">
              <img onClick={()=> router('/')} src="/tied-transparent-logo.png" width={200} />
            </div>
          </div>
          {/* User */}

          {/* Actions */}
          <div className="ml-auto inline-flex items-center justify-center md:mr-10 lg:gap-x-2">
            <div className="mx-4 flex flex-row gap-4">
              <button
                className="md:hidden"
                onClick={() => setShowDrawer(!showDrawer)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <Menu>
                <MenuButton
                  style={{ position: 'relative', display: 'inline-block' }}
                  onClick={handleMenuClick}
                >
                  <BellAlertIcon className="my-2 h-[1.5rem] w-[1.5rem]" />
                  {notifications?.some(
                    (notification) => !notification.isRead,
                  ) && (
                    <span className="text-xs text-white" id="red-dot">
                      {
                        notifications?.filter(
                          (notification) => !notification.isRead,
                        ).length
                      }
                    </span>
                  )}
                </MenuButton>
                <MenuList className="w-[80vw] max-w-[30rem] h-[20rem] overflow-y-scroll">
                  {notifications?.map((notification) => (
                    <MenuItem
                      style={{ textAlign: 'left' }}
                      className={`flex flex-col text-left  `}
                      key={notification._id}
                    >
                      <div
                        className={`text-left rounded-lg p-2 ${
                          !notification.isRead ? notificationColor : null
                        }`}
                      >
                        <Text fontWeight="bold">{notification.title}</Text>
                        <Text>{notification.desc}</Text>
                        <div className="flex flex-row text-sm mt-4 py-4">
                          <div className="flex flex-col">
                            <Text>{notification.createdAt.split('T')[0]}</Text>
                            <Text>
                              {
                                notification.createdAt
                                  .split('T')[1]
                                  .split('.')[0]
                              }
                            </Text>
                          </div>

                          {!notification.isRead && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={(e) =>
                                handleMarkAsRead(e, notification._id)
                              }
                              className="flex ml-auto justify-end"
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </MenuItem>
                  ))}
                  <Button
                    onClick={() => getNotification(notifications.length + 5)}
                    colorScheme="blue"
                    className="mx-4"
                  >
                    Load more...
                  </Button>
                </MenuList>
              </Menu>
            </div>
            <div className="flex flex-row">
              {user && user.avatar ? (
                <Menu>
                  <MenuButton rightIcon={<ChevronDownIcon />}>
                    <img
                      alt="Avatar"
                      className="rounded-full my-2  h-[3rem] w-[3rem]"
                      src={user?.avatar}
                    />
                  </MenuButton>
                  <MenuList className="text-sm">
                    <MenuItem onClick={() => router('/settings')}>
                      Settings{' '}
                      <Cog6ToothIcon className="-mr-[8rem] h-5 w-5 flex flex-1" />
                    </MenuItem>
                    <MenuItem
                      onClick={async () => {
                        await Cookies.remove('token')
                        await localStorage.removeItem('subscriptionDetails')
                        router('/signin')
                      }}
                    >
                      Signout{' '}
                      <ArrowRightOnRectangleIcon className="-mr-[8rem] h-5 w-5 flex flex-1" />
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <Menu>
                  <MenuButton rightIcon={<ChevronDownIcon />}>
                    <UserCircleIcon className="my-2  h-[3rem] w-[3rem]" />
                  </MenuButton>
                  <MenuList className="text-sm">
                    <MenuItem onClick={() => router('/settings')}>
                      Settings{' '}
                      <Cog6ToothIcon className="-mr-[8rem] h-5 w-5 flex flex-1" />
                    </MenuItem>
                    <MenuItem
                      onClick={async () => {
                        await Cookies.remove('token')
                        await localStorage.removeItem('subscriptionDetails')
                        router('/signin')
                      }}
                    >
                      Signout{' '}
                      <ArrowRightOnRectangleIcon className="-mr-[8rem] h-5 w-5 flex flex-1" />
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </div>

            {/* User Name */}
            <button className="inline-flex items-center text-[#767676] justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-4">
              <Menu>
                <MenuButton
                  display={{ base: 'none', md: 'block' }}
                  rightIcon={<ChevronDownIcon />}
                >
                  {user?.fName}
                </MenuButton>
                <MenuList className="text-sm">
                  <MenuItem onClick={() => router('/settings')}>
                    Settings{' '}
                    <Cog6ToothIcon className="-mr-[8rem] h-5 w-5 flex flex-1" />
                  </MenuItem>
                  <MenuItem
                    onClick={async () => {
                      await Cookies.remove('token')
                      await localStorage.removeItem('subscriptionDetails')
                      router('/signin')
                    }}
                  >
                    Signout{' '}
                    <ArrowRightOnRectangleIcon className="-mr-[8rem] h-5 w-5 flex flex-1" />
                  </MenuItem>
                </MenuList>
              </Menu>
            </button>
          </div>
        </div>
      </Box>

      {/* Drawer */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerBody>
            <Box py={2}>
              {/* User Name */}
              {/* Plan ID */}
              <BellAlertIcon className="my-4 mx-2 h-[1.5rem] w-[1.5rem]" />
              <ChatBubbleLeftEllipsisIcon className="my-4 mx-2 h-[1.5rem] w-[1.5rem]" />
              <button className="px-4 py-2 font-medium rounded-lg flex gap-2 hover:text-[#767676]">
                {user?.fName}
              </button>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Header2
