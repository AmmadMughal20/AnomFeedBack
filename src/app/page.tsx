'use client'
import React from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import
{
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import messages from "@/messages.json";

import Autoplay from "embla-carousel-autoplay";

const Home = () =>
{
  return (
    <>
      <main className='flex-grow flex-col items-center justify-center px-4 md:px-24 py-12'>
        <section className='text-center mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-5xl font-bold'>
            Dive into the world of Anonymous Conversations
          </h1>
          <p className='mt-4 text-lg md:text-xl text-gray-700'>
            Explore Mystry Messages - Where your identity is hidden, and your thoughts are free.
          </p>
        </section>

        <Carousel className="w-full max-w-xs m-auto"
          plugins={[Autoplay({ delay: 3000 })]}>
          <CarouselContent>
            {
              messages.map((message, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardHeader className="text-center">
                        <h2 className="text-lg font-semibold">{message.title}</h2>
                      </CardHeader>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        <span className="text-lg">{message.content}</span>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
            }
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </main>
      <footer className='text-center py-4 md:p-6'>
        2025 Mystery Messages. All rights reserved.
      </footer>
    </>
  )
}

export default Home