import React from 'react'
import { useRef, useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Header2 from '../components/Header2'
import { Box, Button, useColorModeValue, useColorMode } from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import SideBar from '../components/sidebar/Main'
import Table from '../partials/DataGrid'
import { ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import Cookies from 'js-cookie'
import { Modal, ModalOverlay, Spinner } from '@chakra-ui/react'

export default function PendingSubmissions() {
  const router = useNavigate()

  const [showDrawer, setShowDrawer] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState(false)
  const [isLoading, setLoading] = useState(true)
  const [tasks, setTasks] = useState(null)
  const [user, setUser] = useState(null)
  const [data2, setData2] = useState([
    {
      taskId: null,
      subName: '',
      taskName: '',
      submissionDate: '',
      submissionTime: '',
      pointValue: null,
    },
  ])

  useEffect(() => {
    if (subscriptionDetails) {
      localStorage.setItem(
        'subscriptionDetails',
        JSON.stringify(subscriptionDetails),
      )
    }
  }, [subscriptionDetails])
  useEffect(() => {
    const url =
      user?.type == 'sub'
        ? `${import.meta.env.VITE_BACKEND_URL}/api/getSubPendingSubmissions`
        : `${import.meta.env.VITE_BACKEND_URL}/api/getPendingSubmissions`
    const fetchTasks = async () => {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
          'Content-Type': 'application/json',
        },
      })

      const resData = await res.json()

      if (resData.error) {
        console.log('Error fetching user')
      } else if (resData.tasks) {
        console.log(resData.tasks)
        setTasks(resData.tasks)
        const temp = resData.tasks.map((d, i) => {
          return {
            taskId: d._id,
            subName: d.subEmail,
            taskName: d.taskName,
            submissionDate: d.endDate.split('T')[0],
            submissionTime: d.dueTime,
            pointValue: d.rewardPoints,
          }
        })
        console.log(temp)
        setData2(temp)
      }
      setLoading(false)
    }
    if (user) {
      fetchTasks()
    }
  }, [user])

  const { colorMode, toggleColorMode } = useColorMode()

  const [email, setEmail] = useState(null)

  const textColor = useColorModeValue('gray.200', 'white')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bg = useColorModeValue('bg-gray-100', 'bg-[#1E293B]')

  const columns = useMemo(
    () => [
      { Header: 'Task ID', accessor: 'taskId' },
      { Header: 'Sub Name', accessor: 'subName' },
      { Header: 'Task Name', accessor: 'taskName' },
      { Header: 'End Date', accessor: 'submissionDate' },
      { Header: 'Submission Time', accessor: 'submissionTime' },
      { Header: 'Point Value', accessor: 'pointValue' },
    ],
    [],
  )

  return (
    <div className="h-[100vh] overflow-y-auto overflow-x-hidden">
    <Modal isCentered isOpen={isLoading}>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
          className="items-center flex justify-center"
        >
          <Spinner size="xl" />
        </ModalOverlay>
      </Modal>
      <Header2
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        setUser={setUser}
        current={0}
        user={user}
        showDrawer={showDrawer}
        setShowDrawer={setShowDrawer}
        subscriptionDetails={subscriptionDetails}
        setSubscriptionDetails={setSubscriptionDetails}
      />
      <div className={`flex pb-40 h-screen}`}>
        <SideBar
          showDrawer={showDrawer}
          user={user}
          email={email}
          router={router}
          setShowDrawer={setShowDrawer}
          toggleColorMode={toggleColorMode}
        />
        <main className="z-1 mx-auto w-full md:pl-64 p-4 overflow-y-auto">
          <Button onClick={() => router(-1)} className="m-2">
            <ArrowUturnLeftIcon className="w-5" />{' '}
          </Button>
          <div className={`${bg} m-2 flex flex-row rounded-lg p-8`}>
            <div className="w-full">
              {' '}
              <h1 className="font-semibold mb-8 w-1/2">Submissions that are available but have not been completed yetSubmissions that are available but have not been completed yet.</h1>
              {data2.length > 0 ? (
                <Table columns={columns} data={data2} />
              ) : (
                'No Data Yet!'
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
