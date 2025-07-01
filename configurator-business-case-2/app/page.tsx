import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Image from "next/image"

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-6 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="row-start-1 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.kleuster.com/?_gl=1%2A571ysc%2A_up%2AMQ..%2A_gs%2AMQ..&gclid=Cj0KCQjwjo7DBhCrARIsACWauSlSc3yAOJ6v0717KJ8X6bVUEE7m7NSPwSVTYB0WYJUYLQOxDU0IpnAaAviKEALw_wcB&gbraid=0AAAAAodwCymMv_HAJpP9_gYiwpQ-Ow22r"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/assets/logo/LogoKLEUSTER.svg"
            alt="kleuster logomark"
            width={255}
            height={35}
            priority
            className="transition-transform duration-200 ease-in-out hover:scale-105"
          />
        </a>
      </header>
      <main className="size-full flex flex-col gap-[32px] row-start-2 justify-start items-start">
        <h1 className="text-4xl font-bold">Sélectionner une gamme</h1>
        <div className="w-full px-24">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="flex w-full transition-shadow duration-200 ease-in-out hover:shadow-lg">
              <CardHeader>
                <CardTitle>BOX</CardTitle>
                <CardDescription>Model Description</CardDescription>
              </CardHeader>
              <CardContent>
                <Carousel>
                  <CarouselContent>
                    <CarouselItem key="box-350">
                      <Image
                        aria-hidden
                        src="/assets/images/box-350-1-r6wgby37id3htv5xrdmja6ddpb6kyqyr9zbnf62d0k.png"
                        alt="box-350"
                        width={255}
                        height={100}
                        priority
                        className="transition-transform duration-200 ease-in-out hover:scale-105"
                      />
                    </CarouselItem>
                    <CarouselItem key="box-freegone">
                      <Image
                        aria-hidden
                        src="/assets/images/box-freegones-r6wgbx5dbj27i97awv7wpolx3xb7r1v0xuo5xw3r6s.png"
                        alt="box-freegone"
                        width={255}
                        height={35}
                        priority
                        className="transition-transform duration-200 ease-in-out hover:scale-105"
                      />
                    </CarouselItem>
                  </CarouselContent>
                </Carousel>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full">Configurer (Model Name)</Button>
              </CardFooter>
            </Card>
            <Card className="flex w-full">
              <CardHeader>
                <CardTitle>PICK-UP</CardTitle>
                <CardDescription>Model Description</CardDescription>
              </CardHeader>
              <CardContent>test</CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full">Configurer (Model Name)</Button>
              </CardFooter>
            </Card>
            <Card className="flex w-full">
              <CardHeader>
                <CardTitle>COLLECT</CardTitle>
                <CardDescription>Model Description</CardDescription>
              </CardHeader>
              <CardContent>test</CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full">Configurer (Model Name)</Button>
              </CardFooter>
            </Card>
            <Card className="flex w-full">
              <CardHeader>
                <CardTitle>FRIDGE</CardTitle>
                <CardDescription>Model Description</CardDescription>
              </CardHeader>
              <CardContent>test</CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full">Configurer (Model Name)</Button>
              </CardFooter>
            </Card>
            <Card className="flex w-full">
              <CardHeader>
                <CardTitle>CLEANER</CardTitle>
                <CardDescription>Model Description</CardDescription>
              </CardHeader>
              <CardContent>test</CardContent>
              <CardFooter className="flex-col gap-2">
                <Button className="w-full">Configurer (Model Name)</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  )
}
