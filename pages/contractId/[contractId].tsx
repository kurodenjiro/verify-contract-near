import { useRouter } from 'next/router'
import useSWR from 'swr'
import Head from "next/head";
import type { Contract, ResponseError } from '../../interfaces'
import MultipleFileUploadForm from "../../components/MultipleFileUploadForm";
import SingleFileUploadForm from "../../components/SingleUploadForm";

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = await res.json()

  if (res.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

export default function CheckPage() {
  const { query } = useRouter()
  const { data, error, isLoading, isValidating } = useSWR<
		Contract,
    ResponseError
  >(() => (query.contractId ? `/api/contractId/${query.contractId}` : null), fetcher)

  if (error) return <div>{error.message}</div>
  if (isLoading) return <div>Loading...</div>
  if (!data) return null

  return (
    <div>
      <Head>
        <title>File uploader </title>
        <meta name="description" content="File uploader" />
      </Head>

      <main className="py-10">
        <div className="w-full max-w-3xl px-3 mx-auto">
          <h1 className="mb-10 text-3xl font-bold text-gray-900">
            Upload your files
          </h1>

          <div className="space-y-10">
            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                Single File Upload Form
              </h2>
              <SingleFileUploadForm ContractId={query.contractId}/>
            </div>
            <div>
              <h2 className="mb-3 text-xl font-bold text-gray-900">
                Multiple File Upload Form
              </h2>
              <MultipleFileUploadForm ContractId={query.contractId} />
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="w-full max-w-3xl px-3 mx-auto">
          <p>All right reserved</p>
        </div>
      </footer>
    </div>
  )
}