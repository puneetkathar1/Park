import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header2 from '../components/Header2'
import { useParams } from 'react-router-dom'
import {
  Box,
  Button,
  useColorModeValue,
  useColorMode,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react'
import { useDisclosure } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import SideBar from '../components/sidebar/Main'
import {
  ArrowUpTrayIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline'
import Cookies from 'js-cookie'
export default function SubmitTask() {
  const router = useNavigate()
  const { id } = useParams()
  const toast = useToast()
  const [showDrawer, setShowDrawer] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState(false)
  const [data, setData] = useState(null)
  const [imageFile, setImageFile] = useState([])
  const [email, setEmail] = useState(null)
  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({
    selectedTaskId: null,
    isMediaReq: false,
    isSubmissionReq: false,
    textSubmission: '',
  })
  useEffect(() => {
    if (user && user.type === 'dom') {
      router('/404')
    }
  }, [user])
  useEffect(() => {
    if (subscriptionDetails) {
      localStorage.setItem(
        'subscriptionDetails',
        JSON.stringify(subscriptionDetails),
      )
    }
  }, [subscriptionDetails])
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/getSubPendingSubmissions`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const resData = await res.json()

      if (resData.error) {
        console.log('Error fetching user')
      } else if (resData.tasks) {
        console.log(resData.tasks)
        setData(resData.tasks)
      }
    }
    fetchTasks()
  }, [])

  useEffect(() => {
    if (id && data) {
      const temp = data.filter((el) => el._id == id)
      console.log(temp)
      setFormData({
        ...data,
        selectedTaskId: id,
        isMediaReq: temp[0].isMediaReq,
        isSubmissionReq: temp[0].isSubmissionReq,
      })
    }
  }, [id, data])

  const handleSelectChange = (event) => {
    const selectedValue = event.target.value
    const temp = data.filter((el) => el._id == selectedValue)
    console.log(temp)
    setFormData({
      ...data,
      selectedTaskId: event.target.value,
      isMediaReq: temp[0].isMediaReq,
      isSubmissionReq: temp[0].isSubmissionReq,
    })
    // Handle the selected value here
    console.log('Selected value:', selectedValue)
  }
  const handleFileChange = (event) => {
    const files = event.target.files
    setImageFile(files) // Assuming you have a state variable to store the array of files
    console.log(files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.isSubmissionReq && !formData.textSubmission?.length > 0) {
      toast({
        title: 'Submission text required!',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    } else if (formData.isMediaReq && !imageFile) {
      toast({
        title: 'Media required!',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
    } else {
      setIsLoading(true)
      const token = Cookies.get('token') // Assuming you have a library like 'js-cookie' to retrieve the token from the cookie

      const formData2 = new FormData()
      formData2.append('selectedTaskId', formData.selectedTaskId)
      formData2.append('textSubmission', formData.textSubmission)
      for (let i = 0; i < imageFile.length; i++) {
        formData2.append(`image`, imageFile[i])
      }

      fetch(`${import.meta.env.VITE_BACKEND_URL}/api/submitTask`, {
        method: 'POST',
        body: formData2,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((res2) => {
          console.log(res2.message)
          setIsLoading(false)
          toast({
            title: 'Submitted!',
            status: 'success',
            duration: 9000,
            isClosable: true,
          })
        })
        .catch((error) => {
          setIsLoading(false)
          console.error(error)
          toast({
            title: 'Something went wrong!',
            status: 'error',
            duration: 9000,
            isClosable: true,
          })
        })
    }
  }

  const { colorMode, toggleColorMode } = useColorMode()

  const textColor = useColorModeValue('gray.200', 'white')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bg = useColorModeValue('bg-gray-100', 'bg-[#1E293B]')

  return (
    <div className="h-[100vh] overflow-y-auto overflow-x-hidden">
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
              <h1 className="font-semibold mb-8">Submit tasks</h1>
              <div className="mt-6 gap-4">
                <Select
                  value={formData.selectedTaskId}
                  onChange={handleSelectChange}
                >
                  <option value={null}>Select Tasks</option>
                  {data?.map((d, i) => {
                    return (
                      <option key={d?._id} value={d._id}>
                        {d.taskName}
                      </option>
                    )
                  })}
                </Select>
              </div>
              <div className="mt-6 flex gap-4">
                {formData.isMediaReq ? (
                  <>
                    <Input
                      type="file"
                      display="none"
                      id="file-upload"
                      onChange={handleFileChange}
                      multiple
                    />
                    <label htmlFor="file-upload">
                      <Button
                        className="mt-6"
                        bg="brand"
                        textColor="white"
                        rightIcon={<ArrowUpTrayIcon className="w-5 h-5" />}
                        as="span"
                      >
                        {imageFile?.name || 'Upload Image Submission'}
                      </Button>
                    </label>
                  </>
                ) : null}
              </div>
              <div className="mt-6 flex gap-4">
                {formData.isSubmissionReq ? (
                  <Textarea
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        textSubmission: e.target.value,
                      })
                    }
                    value={formData.textSubmission}
                    placeholder="Submission Text (in max 200 chars)"
                    maxLength={200}
                  />
                ) : null}
              </div>
              <div className="mt-6 flex gap-4">
                <Button
                  isLoading={isLoading}
                  colorScheme="green"
                  onClick={(e) => handleSubmit(e)}
                  hidden={!formData.selectedTaskId}
                >
                  Submit task
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
